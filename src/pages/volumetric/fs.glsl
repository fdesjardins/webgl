uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;
uniform float iCameraFov;

varying vec2 texCoord;
varying vec2 vUv;

const int MAX_MARCHING_STEPS = 250;
const float MIN_DIST = 0.0;
const float MAX_DIST = 1000.0;
const float EPSILON = 0.0005;

const vec3 RED = vec3(1.0, 0.0, 0.0);
const vec3 GREEN = vec3(0.0, 1.0, 0.0);
const vec3 BLUE = vec3(0.0, 0.0, 1.0);
const vec3 ORANGE = vec3(0.8, 0.5, 0.0);

float sphereSD(vec3 pos, float rad) {
  return length(pos) - rad;
}

float boxSD(vec3 pos, vec3 r) {
  vec3 q = abs(pos) - r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

vec4 scene(vec3 pos) {
  vec3 spos = pos;
  spos.y += 0.04 * sin(-7.0 * pos.x + iTime * 6.0);
  spos.x += 0.04 * sin(-7.0 * pos.z + iTime * 6.0);
  vec4 s1 = vec4(sphereSD(spos, 1.1), vec3(0.1, 0.2, 0.5));

  vec3 s2pos = pos + vec3(2.0, 0.0, 0.0);
  vec4 s2 = vec4(sphereSD(s2pos, 0.5), RED * 0.25);

  vec3 bpos = pos + vec3(0.0, 0.0, 2.0);
  vec4 b1 = vec4(boxSD(bpos, vec3(0.5)), GREEN * 0.5);

  vec3 s3pos = pos - vec3(2.0, 0.0, 0.0);
  vec4 s3 = vec4(sphereSD(s3pos, 0.5), mix(RED, GREEN, 0.5));

  vec3 b2pos = pos - vec3(0.0, 0.0, 2.0);
  vec4 b2 = vec4(boxSD(b2pos, vec3(0.5)), mix(RED, BLUE, 1.0));

  vec4 res = s1;
  if (res.x > s2.x) { res = s2; }
  if (res.x > b1.x) { res = b1; }
  if (res.x > s3.x) { res = s3; }
  if (res.x > b2.x) { res = b2; }
  return res;
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

vec4 trace(vec3 origin, vec3 dir) {
  float depth = MIN_DIST;
  for (int i=0; i < MAX_MARCHING_STEPS; i+=1) {
    vec4 drgb = scene(origin + depth * dir);
    float dist = drgb.x;
    depth += dist;
    if (dist < EPSILON) {
      return vec4(depth, drgb.yzw);
    }
    if (depth >= MAX_DIST) {
      return vec4(MAX_DIST, vec3(0.0));
    }
  }
  return vec4(MAX_DIST, vec3(0.0));
}

vec4 through(vec3 origin, vec3 dir) {
  float depth = MIN_DIST;
  vec3 color = vec3(0.0);
  vec3 n = estimateNormalFast(origin);
  for (int i=0; i < MAX_MARCHING_STEPS; i+=1) {
    vec4 drgb = scene(origin + depth * dir);
    float dist = drgb.x;
    depth += 0.01;
    if (dist < 0.0) {
      color += drgb.yzw * 0.0075;
      continue;
    }
    dir += n * 0.1;
    vec3 posteriorPos = origin + dir * depth + dir;
    vec3 n2 = estimateNormalFast(posteriorPos);
    dir += n2 * 0.1;

    vec4 behind = trace(posteriorPos, dir);
    if (behind.x >= MAX_DIST) {
      return vec4(MAX_DIST, mix(color, vec3(0.0), 0.1));
    }

    vec3 c = mix(color, behind.yzw - color, 0.1);
    return vec4(dist + behind.x, c);
  }
  return vec4(MAX_DIST, vec3(0.0));
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

void main() {
  vec3 camPos = iCameraPosition;
  vec3 camDir = iCameraDirection;
  vec3 camTarget = camPos + camDir;
  float camFov = iCameraFov;

  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy, iResolution);
  vec3 rayDir = getRayDirection(uv, camPos, camTarget, camFov);
  vec4 result = trace(camPos, rayDir);
  vec3 color = result.yzw;

  if (result.x == MAX_DIST) {
    color = vec3(0.0);
    return;
  }

  vec3 origin = camPos + result.x * rayDir + rayDir * (EPSILON + 0.01);
  vec4 otherSide = through(origin, rayDir);
  color = vec3(otherSide.yzw);
  origin = camPos + otherSide.x * rayDir + (EPSILON + 0.01) * rayDir;

  vec4 final = trace(origin, rayDir);
  color = mix(color, final.yzw, 0.075);

  // gamma correction
  color.xyz = pow(vec4(color, 1.0), vec4(1.0/2.2)).xyz;

  gl_FragColor = vec4(color, 1.0);
}
