precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;
uniform float iCameraFov;

const int MAX_MARCHING_STEPS = 300;
const float MIN_DIST = 0.0;
const float MAX_DIST = 1000.0;
const float EPSILON = 0.01;

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

const vec3 EARTH = vec3(0.4, 0.2, 0.0);
const vec3 WATER = vec3(0.5, 0.6, 1.0);

float fbm(vec2 p) {
  float f = 0.0;
  // Here we construct a rotation matrix using Pythagorean
  // triples to avoid using sin and cos
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  f = 0.5     * noise(p); p *= m;
  f += 0.25   * noise(p); p *= m;
  f += 0.125  * noise(p); p *= m;
  f += 0.0625 * noise(p); p *= m;
  f += 0.03125 * noise(p); p *= m;
  f += 0.015625 * noise(p); p *= m;
  f += 0.0078125 * noise(p); p *= m;
  // 0.015625
  return f;
}

vec3 lightPos() {
  return vec3(8.0 * sin(iTime/2.0), 4.0, 8.0 * cos(iTime/2.0));
}

vec4 scene(vec3 pos) {
  if (abs(pos.x) > 25.0 || abs(pos.z) > 25.0 || abs(pos.y) > 7.0) {
    return vec4(MAX_DIST);
  }
  vec3 col = EARTH;
  float d = MAX_DIST;

  d = sphereSD(pos + lightPos(), 0.5);
    // vec3(
    //   pos.x + sin(iTime),
    //   pos.y - 1.0 + sin(iTime),
    //   pos.z + cos(iTime)), 0.5);

  // mountains
  float n = (10.0 * fbm(pos.xz / 7.5));
  d = min(d, planeSD(
    vec3(
      pos.x,
      pos.y + 1.75,// + sin(pos.x + iTime) + sin(pos.z) + cos(pos.z*2.0),
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
  // if (pos.y + sin(pos.z * 18.0)*0.2 > 1.0 && pos.y + cos(pos.x * 18.0)*0.3 > 1.0) {
    // if (n > 5.0) {
    // col = vec3(0.75 - (-pos.y/3.0));
    // col = vec3(n);
    col += vec3(max(0.2, (n-3.75)));
  // }
  // col -= 0.25 * vec3(noise(pos.xz * 6.0));
  col -= 0.1 * vec3(n);
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

  // sky color
  vec3 color = vec3(0.0);
  // color += vec3(0.5, 0.7, 1.0) * (-rayDir.y*2.0);

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
  vec3 surfacePos = camPos + rayDir * result.x;
  if (surfacePos.y < 0.15) {
    color = mix(color, vec3(0.15, 0.15, 0.18) * vec3(0.02) * pow(result.x, 2.0), (-surfacePos.y - 0.35)*1.0);
  }
  // sky color
  if (result.x == MAX_DIST) {
    float cloud = 0.5*fbm(vec2(rayDir.x+iTime/64.0, rayDir.y)*4.0);
    color = vec3((EARTH+WATER)/2.0 + (-1.0 * rayDir.y));
    color += cloud;
  }

   // gamma correction
  // color.xyz = pow(vec4(color, 1.0), vec4(1.0/2.2)).xyz;

  gl_FragColor = vec4(color, 1.0);
}
