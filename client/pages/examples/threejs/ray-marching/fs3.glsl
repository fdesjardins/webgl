#define AA 1

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 cameraPos;
uniform vec3 cameraDir;
uniform sampler2D iChannel0;

varying vec2 texCoord;
varying vec2 vUv;

// const vec2 RESOLUTION = vec2(723, 723);
const int MAX_MARCHING_STEPS = 250;
const float MIN_DIST = 0.0;
const float MAX_DIST = 1000.0;
const float EPSILON = 0.001;

vec3 WHITE = vec3(1.0, 1.0, 1.0);
vec3 RED = vec3(1.0, 0.0, 0.0);
vec3 GREEN = vec3(0.0, 1.0, 0.0);
vec3 BLUE = vec3(0.0, 0.0, 1.0);

vec3 BG_COLOR = vec3(0.1, 0.2, 0.3);

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float sdBox(vec3 p, vec3 r) {
  return length(max(abs(p) - r, 0.0));
}

float sdBox2(vec2 p, vec2 r) {
  return length(max(abs(p) - r, 0.0));
}

float sdTorus(vec3 p, vec2 t){
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float checkers(vec2 pos) {
  vec2 w = fwidth(pos) + 0.001;
  vec2 i = 2.0 * (abs(fract((pos - 0.5 * w) * 0.5) - 0.5) - abs(fract((pos + 0.5 * w) * 0.5) - 0.5)) / w;
  return 0.5 - 0.5 * i.x * i.y;
}

float sdUnion(float d1, float d2) {
  return min(d1, d2);
}

float sdRepeat(float d, float domain) {
  return mod(d, domain) - domain / 2.0;
}

vec3 applyFog(vec3 rgb, vec3 fogColor, float dist) {
  float fogAmount = 1.0 - exp(-dist / 15.0);
  return mix(rgb, fogColor, fogAmount);
}

// vec3 opRepLim(vec3 p, float s, vec3 lim){
//   return p - s * clamp(round(p / s), -lim, lim);
// }

vec3 opRep(vec3 p, float s) {
  return mod(p + s * 0.5, s) - s * 0.5;
}

float smax(float a, float b, float k) {
  float h = max(k - abs(a-b), 0.0);
  return max(a, b) + (0.25/k)*h*h;
}

float sdCross(vec3 p, vec3 r) {
  p = abs(p);
  p.xz = (p.z > p.x) ? p.zx : p.xz;
  return length(max(p-r, 0.0));
}

float sdVStick(vec3 p, float h) {
  float d = max(p.y - h, 0.0);
  return sqrt(p.x*p.x + p.z*p.z + d*d);
}

vec4 gear(vec3 pos, float time, float offset) {
    vec3 q1 = pos;
    pos.y = abs(pos.y);

    float sectorSize = 6.283185/12.0;

    // rotate along the y axis
    float an = time + offset * sectorSize / 2.0;
    an = q1.y > 0.0 ? an : -1.0 * an;
    pos.xz = mat2(cos(an), -sin(an),
                  sin(an),  cos(an)) * pos.xz;

    // gear
    float angle = sectorSize;
    float sector = round(atan(pos.z, pos.x) / angle);
    vec3 q = pos;
    float an2 = sector * angle;
    q.xz = mat2(cos(an2), -sin(an2),
                sin(an2),  cos(an2)) * q.xz;

    float d1 = sdBox2(q.xz - vec2(1.0, 0.0), 0.5*vec2(0.5, 0.225)) - 0.05;
    float d2 = abs(length(pos.xz)-0.92) - 0.12;

    d1 = min(d1,d2);

    // cross
    d2 = sdCross(pos - vec3(0.0,2.9,0.0), vec3(0.8, 0.04, 0.04)) - 0.03;
    d1 = min(d1,d2);

    float r = length(pos);
    d1 = smax(d1, abs(r-3.0) - 0.165, 0.04);

    // axle
    d2 = sdVStick(pos, 3.0) - 0.05;
    d1 = min(d1,d2);

    return vec4(d1, pos);
}

vec2 rot45(vec2 v) {
  return vec2(v.x + v.y, v.x - v.y) * 0.707107;
}

vec4 sdScene(vec3 p) {
  float time = iTime;

  // sphere in middle
  vec4 d = vec4(sdSphere(p, 0.75), 0.0, 0.0, 0.0);

  vec3 qx = vec3(rot45(p.zy), p.x); if (abs(qx.x) > abs(qx.y)) qx = qx.zxy;
  vec3 qy = vec3(rot45(p.xz), p.y); if (abs(qy.x) > abs(qy.y)) qy = qy.zxy;
  vec3 qz = vec3(rot45(p.xy), p.z); if (abs(qz.x) > abs(qz.y)) qz = qz.zxy;

  vec3 qa = abs(p);
  if (qa.x > qa.y && qa.x > qa.z) {
    qa = p.yxz;
    time *= -1.0;
  } else if (qa.z > qa.y && qa.z > qa.x) {
    qa = p.xzy;
    time *= -1.0;
  } else {
    qa = p.xyz;
  }

  // gears
  vec4 d1;
  d1 = gear(qa,  time,  0.0); if (d1.x < d.x) d = d1;
  d1 = gear(qx, -iTime, 1.0); if (d1.x < d.x) d = d1;
  d1 = gear(qy, -iTime, 1.0); if (d1.x < d.x) d = d1;
  d1 = gear(qz,  iTime, 1.0); if (d1.x < d.x) d = d1;

  return d;
}


vec4 castRay(vec3 origin, vec3 dir) {
  float depth = MIN_DIST;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec4 tuvw = sdScene(origin + depth * dir);
    float dist = tuvw.x;
    if (dist < EPSILON) {
	    return vec4(depth, tuvw.yzw);
    }
    depth += dist;
    if (depth >= MAX_DIST) {
      return vec4(MAX_DIST, 0.0,0.0,0.0);
    }
  }
  return vec4(MAX_DIST, 0.0,0.0,0.0);
}

vec2 normalizeScreenCoords(vec2 fragCoord) {
  vec2 result = 2.0 * (fragCoord / iResolution - 0.5);
  result.x *= iResolution.x / iResolution.y;
  return result;
}

vec3 getRayDirection(vec2 uv, vec3 pos, vec3 target) {
  vec3 j = vec3(0.0, 1.0, 0.0);
  vec3 forward = normalize(target - pos);
  vec3 right = normalize(cross(j, forward)) * -1.0;
  vec3 up = normalize(cross(forward, right)) * -1.0;
  float fov = 2.0;
  return normalize(uv.x * right + uv.y * up + forward * fov);
}

vec3 estimateNormal(vec3 pos) {
  vec4 tuvw = sdScene(pos);
  vec2 offset = vec2(0.001, 0.0);
  return normalize(vec3(
    sdScene(pos + offset.xyy).x,
    sdScene(pos + offset.yxy).x,
    sdScene(pos + offset.yyx).x
  ) - tuvw.x);
}

vec3 lambertIllumination(vec3 color, vec3 p, vec3 eye) {
  const vec3 ambientLight = 0.35 * vec3(1.0, 1.0, 1.0);
  vec3 diffuse = ambientLight * color;

  vec3 lightPosition = vec3(4.0 * sin(iTime), 2.0, 4.0 * cos(iTime));
  vec3 lightIntensity = vec3(0.85, 0.85, 0.85);

  vec3 N = estimateNormal(p);
  vec3 L = normalize(lightPosition - p);

  float dotLN = dot(L, N);
  // Light not visible from this point on the surface
  if (dotLN < 0.0) {
    return diffuse;
  }
  diffuse += dotLN * color * lightIntensity;
  return diffuse;
}

float calcAO(vec3 pos, vec3 normal, float time) {
	float occ = 0.0;
  float sca = 1.0;
  for( int i=0; i<5; i++ )
  {
    float h = 0.01 + 0.12*float(i)/4.0;
    float d = sdScene( pos+h*normal ).x;
    occ += (h-d)*sca;
    sca *= 0.95;
  }
  return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );
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

  vec3 lightPosition = vec3(4.0 * sin(iTime), 2.0, 4.0 * cos(iTime));
  vec3 lightIntensity = vec3(0.5, 0.5, 0.5);

  color += calcPhong(k_d, k_s, alpha, p, eye, lightPosition, lightIntensity);

  return color;
}

vec4 render(vec3 origin, vec3 dir) {
  vec4 tuvw = castRay(origin, dir);
  float depth = tuvw.x;
  vec3 pos = origin + depth * dir;

  vec3 color;
  if (depth == MAX_DIST) {
    color = BG_COLOR + (dir.y * 0.5);
  } else {
    vec3 normal = estimateNormal(pos);

    // color = 0.5 + 0.5 * normal;

    vec4 te = 0.5 * texture(iChannel0, tuvw.yz * 2.0) +
              0.5 * texture(iChannel0, tuvw.yw * 2.0);
    color = te.xyz * 0.25;

    vec3 K_a = vec3(0.15, 0.15, 0.15);
    vec3 K_d = vec3(0.4, 0.4, 0.4);
    vec3 K_s = vec3(1.0, 1.0, 1.0);
    float shininess = 10.0;

    color += phongIllumination(K_a, K_d, K_s, shininess, pos, origin);
    // color = lambertIllumination(color, pos, origin);

    // if (pos.x > 2.0) {
    //   color = lambertIllumination(RED, pos, origin);
    // }
    // if (pos.y > 2.0) {
    //   color = lambertIllumination(GREEN, pos, origin);
    // }
    // if (pos.z > 2.0) {
    //   color = lambertIllumination(BLUE, pos, origin);
    // }

    float occ = calcAO(pos+normal*0.001, normal, iTime) * 1.0;
    color *= occ;

    // color = applyFog(color, vec3(0.6, 0.6, 0.6), depth);
  }

  return vec4(depth, color);
}

void main(){
  vec3 cameraTarget = cameraPos + vec3(cameraDir.x, cameraDir.y, cameraDir.z);
  // vec3 cameraTarget = vec3(0.0, 0.0, 0.0);

  vec4 total = vec4(0.0);

  #if AA>1
  for (int m=0; m<AA; m++)
  for (int n=0; n<AA; n++) {
    // vec2 o = vec2(float(m),float(n)) / float(AA) - 0.5;
    vec2 uv = normalizeScreenCoords(gl_FragCoord.xy);
    #else
    vec2 uv = normalizeScreenCoords(gl_FragCoord.xy);
    #endif

    vec3 rayDirection = getRayDirection(uv, cameraPos, cameraTarget);

    vec4 final = render(cameraPos, rayDirection);
    total.yzw += final.yzw;
    total.x = final.x;

  #if AA>1
    total.yzw /= float(AA);
  }
  #endif

  gl_FragDepth = total.x / 100.0;
  gl_FragColor = vec4(total.yzw, 1.0);
}
