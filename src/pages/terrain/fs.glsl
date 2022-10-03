precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;
uniform float iCameraFov;

const int MAX_MARCHING_STEPS = 300;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.1;

float sphereSD(vec3 pos, float rad) {
  return length(pos) - rad;
}

float planeSD(vec3 pos, float y) {
  return pos.y - y;
}

// http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(vec2 co)
{
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt= dot(co.xy ,vec2(a,b));
  highp float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}

float noise(vec2 p) {
  vec2 s = floor(p);
  vec2 t = fract(p);
  vec2 u = t * t * (3.0 - 2.0*t);
  return mix(
    mix(rand(s + vec2(0.0, 0.0)),
        rand(s + vec2(1.0, 0.0)),
        u.x),
    mix(rand(s + vec2(0.0, 1.0)),
        rand(s + vec2(1.0, 1.0)),
        u.x),
    u.y);
}

const vec3 EARTH = vec3(0.03, 0.01, 0.01);
const vec3 WATER = vec3(0.5, 0.6, 1.0);

float fbm(vec2 p, int levels) {
  // Here we construct a rotation matrix using Pythagorean
  // triples to avoid using sin and cos
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  float f = 0.0;//5 * noise(p);
  float d = 2.0;
  for (int i=0; i<levels; i++) {
    f += 1.0/d * noise(p);
    p *= m;
    d *= 2.0;
  }
  return f;
}

vec3 lightPos() {
  return vec3(8.0 * sin(iTime/2.0), 4.0, 8.0 * cos(iTime/2.0));
}

vec4 scene(vec3 pos) {

  vec3 col = EARTH;
  float d = MAX_DIST;

  d = sphereSD(pos - lightPos(), 0.25);

  // mountains
  float n = (9.0 * fbm(pos.xz / 7.5, 8));
  d = min(d, planeSD(
    vec3(
      pos.x,
      pos.y + 1.85,// + sin(pos.x + iTime) + sin(pos.z) + cos(pos.z*2.0),
      pos.z
    ) - n,
    -2.0
  ));

  // water
  float d2 = planeSD(
    vec3(
      pos.x,
      //pos.y,// + (sin((pos.x - sin(pos.z))*24.0) + cos(pos.x*13.0+iTime))/128.0 - n/8.0,
      pos.y - 0.1 - n/8.0 - 0.025 * sin(iTime * 0.75 + pos.x),
      pos.z
    ), -1.5);

  if (d2 < d) {
    return vec4(d2, WATER);
  }

  // snow caps
  // col -= 0.15 * vec3(pow(n,0.5)-2.5) * fbm(pos.xz/8.0, 3);
  col += vec3(pow(n-3.0,2.0));
  col -= max(0.0,n-4.5) * (3.5*fbm(pos.xz/32.0, 3));

  return vec4(d, col);
}

vec4 trace(vec3 origin, vec3 dir) {
  float depth = MIN_DIST;
  for (int i=0; i < MAX_MARCHING_STEPS; i+=1) {
    vec4 drgb = scene(origin + depth * dir);
    float dist = drgb.x;
    if (depth >= MAX_DIST) {
      return vec4(MAX_DIST, vec3(0.0));
    }
    depth += dist / 3.0;
    if (dist <= EPSILON) {
      return vec4(depth, drgb.yzw);
    }
  }
  return vec4(MAX_DIST, vec3(0.0));
}

vec3 estimateNormalFast(vec3 pos) {
  vec4 drgb = scene(pos);
  vec2 offset = vec2(0.001, 0.0);
  return normalize(vec3(
    scene(pos + offset.xyy).x,
    scene(pos + offset.yxy).x,
    scene(pos + offset.yyx).x
  ) - drgb.x);
}

vec3 estimateNormal(vec3 pos) {
  vec2 e = vec2(.001, 0.0);
	return normalize(vec3(
    scene(pos + e.xyy).x - scene(pos - e.xyy).x,
    scene(pos + e.yxy).x - scene(pos - e.yxy).x,
    scene(pos + e.yyx).x - scene(pos - e.yyx).x
  ));
}

vec3 calcPhong(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye, vec3 lightPos, vec3 lightIntensity) {
  vec3 N = estimateNormal(p);
  vec3 L = normalize(lightPos - p);
  vec3 V = normalize(eye - p);
  vec3 R = normalize(reflect(-L, N));

  float dotLN = dot(L, N);
  float dotRV = dot(R, V);

  // Light not visible from this point on the surface
  if (dotLN < 0.0) {
    return vec3(0.0, 0.0, 0.0);
  }

  // Light reflection in opposite direction as viewer, apply only diffuse
  if (dotRV < 0.0) {
    return lightIntensity * (k_d * dotLN);
  }
  return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
}

vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
  const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
  vec3 color = ambientLight * k_a;

  vec3 lightPosition = lightPos();
  vec3 lightIntensity = vec3(0.5, 0.5, 0.5);

  color += calcPhong(k_d, k_s, alpha, p, eye, lightPosition, lightIntensity);

  return color;
}

vec3 lambert(vec3 color, vec3 pos, vec3 eye) {
  vec3 ambientLight = 0.35 * vec3(1.0, 1.0, 1.0);
  vec3 diffuse = ambientLight * color;

  // vec3 lightPos = vec3(4.0 + sin(iTime), 2.0, 4.0 + cos(iTime));
  vec3 lightPos = lightPos();
  vec3 lightIntensity = vec3(0.85, 0.85, 0.85);

  vec3 N = estimateNormalFast(pos);
  vec3 L = normalize(lightPos - pos);

  float dotLN = dot(L, N);
  // Light not visible from this point on the surface
  if (dotLN < 0.0) {
    return diffuse;
  }
  diffuse += dotLN * color * lightIntensity;
  return diffuse;
}

vec3 getRayDirection(vec2 uv, vec3 origin, vec3 target, float fov) {
  vec3 forward = normalize(target - origin);
  vec3 right = -1.0 * normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = -1.0 * normalize(cross(forward, right));
  return normalize(uv.x * right + uv.y * up + forward * fov);
}

vec2 normalizeScreenCoords(vec2 fragCoord, vec2 resolution) {
  vec2 result = 2.0 * (fragCoord / resolution - 0.5);
  result.x *= resolution.x / resolution.y;
  return result;
}

float calcShadow(vec3 pos) {
  float res = 1.0;
  vec3 dir = normalize(lightPos() - pos);
  for (float t = 0.1; t <= MAX_DIST; ) {
    float h = scene(pos + dir * t).x;
    if (h < 0.001) {
      return 0.0;
    }
    res = min(res, 8.0 * h / t);
    t += h;
  }
  return res;
}

void main() {
  vec3 camPos = iCameraPosition;
  vec3 camDir = iCameraDirection;
  vec3 camTarget = camPos + camDir;
  float camFov = iCameraFov;

  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy, iResolution);
  vec3 rayDir = getRayDirection(uv, camPos, camTarget, camFov);

  vec3 color = vec3(0.0);

  vec4 result = trace(camPos, rayDir);
  if (result.x < MAX_DIST) {
    // color = result.yzw * lambert(vec3(1.0), camPos + rayDir * result.x, camPos);
    if (result.yzw == WATER) {
      color = result.yzw * phongIllumination(
          vec3(0.7),
          vec3(0.85),
          vec3(1.0),
          1.0,
          camPos + rayDir * result.x,
          camPos
      );
    } else {
      color = result.yzw * lambert(vec3(0.75), camPos + rayDir * result.x, camPos);
    }
  }

  // float inShadow = calcShadow(camPos + rayDir * result.x);
  // if (inShadow != 1.0) {
  //   color *= clamp(inShadow, 0.0, 1.0);
  // }

  // fog
  color = mix(color, vec3(0.15, 0.15, 0.28), smoothstep(0.0, MAX_DIST/2.0, result.x));

  // sky color
  if (result.x == MAX_DIST) {
    float cloud = 0.75*fbm(vec2(rayDir.z+iTime/64.0, rayDir.y)*4.0, 7);
    color = vec3((WATER)/2.0 + (-1.0 * rayDir.y));
    color += cloud;
  }

   // gamma correction
  color.xyz = pow(vec4(color, 1.0), vec4(1.0/2.2)).xyz;

  gl_FragColor = vec4(color, 1.0);
}
