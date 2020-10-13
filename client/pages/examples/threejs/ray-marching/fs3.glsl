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

vec3 lightPos = vec3(5.0, 0.0, 5.0);

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

vec4 gear(vec3 pos, float time) {
    pos.y = abs(pos.y);

    pos.xz = mat2(cos(time), -sin(time),
                sin(time), cos(time)) * pos.xz;

    // gear
    float angle = 6.283185/12.0;
    float sector = round(atan(pos.z, pos.x) / angle);
    vec3 q = pos;
    float an = sector * angle;
    q.xz = mat2(cos(an), -sin(an),
                sin(an), cos(an)) * q.xz;

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

    return vec4(d1, pos.xzy);
}

vec4 sdScene(vec3 pos) {
  // oscillate up and down
  pos.y += 0.5*sin(iTime/1.2);

  // gears
  vec4 d1 = gear(pos, iTime);
  vec4 d2 = gear(pos.yzx, iTime); d1 = (d2.x < d1.x) ? d2 : d1;
       d2 = gear(pos.zxy, iTime); d1 = (d2.x < d1.x) ? d2 : d1;

  // center sphere
  float d3 = sdSphere(pos, 0.75);
  d1.x = min(d1.x, d3);

  return vec4(d1.x, pos);
}


float castRay(vec3 origin, vec3 dir) {
  float depth = MIN_DIST;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec4 tuvw = sdScene(origin + depth * dir);
    float dist = tuvw.x;
    if (dist < EPSILON) {
	    return depth;
    }
    depth += dist;
    if (depth >= MAX_DIST) {
      return MAX_DIST;
    }
  }
  return MAX_DIST;
}

vec2 normalizeScreenCoords(vec2 fragCoord) {
  vec2 result = 2.0 * (fragCoord / iResolution - 0.5);
  result.x *= iResolution.x / iResolution.y;
  return result;
}

vec3 getRayDirection(vec2 uv, vec3 pos, vec3 target) {
  vec3 j = vec3(0.0, 1.0, 0.0);
  vec3 forward = normalize(target - pos);
  vec3 right = normalize(cross(j, forward));
  vec3 up = normalize(cross(forward, right));
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
  vec3 lightIntensity = vec3(0.5, 0.5, 0.5);

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

vec4 render(vec3 origin, vec3 dir) {
  float depth = castRay(origin, dir);
  vec3 pos = origin + depth * dir;

  vec3 color;
  if (depth == MAX_DIST) {
    color = vec3(0.1, 0.2, 0.3) + (dir.y * 0.5);
  } else {
    // vec3 normal = estimateNormal(pos);
    // color = 0.5 + 0.5 * normal;
    // vec4 te = texture(iChannel0, vUv*normal.yz);
    // color = te.xyz;
    color = lambertIllumination(vec3(1.0, 1.0, 1.0), pos, origin);

    // color = applyFog(color, vec3(0.6, 0.6, 0.6), depth);
  }

  return vec4(depth, color);
}

void main(){
  vec3 cameraTarget = vec3(0.0, 0.0, 0.0);

  //vec3 cameraTarget = cameraPos * vec3(cameraDir.x, cameraDir.y, cameraDir.z);

  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy);
  vec3 rayDirection = getRayDirection(uv, cameraPos, cameraTarget);

  vec4 final = render(cameraPos, rayDirection);

  gl_FragColor = vec4(final.yzw, 1.0);
  gl_FragDepth = final.x / 100.0;
}
