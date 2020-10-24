uniform float iTime;
uniform vec3 cameraPos;
uniform vec3 cameraDir;

varying vec2 texCoord;
varying vec2 vUv;

const vec2 RESOLUTION = vec2(1127, 1127);
const int MAX_MARCHING_STEPS = 250;
const float MIN_DIST = 0.0;
const float MAX_DIST = 1000.0;
const float EPSILON = 0.001;

vec3 lightPos = vec3(5.0, 0.0, 5.0);

float sdSphere(vec3 p, float s) {
  return length(p) - s;
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

vec3 fogColor = vec3(0.3, 0.4, 0.7);
vec3 applyFog(vec3 rgb, float dist) {
  float fogAmount = 1.0 - exp(-dist / 15.0);
  return mix(rgb, fogColor, fogAmount);
}

// vec3 opRepLim(vec3 p, float s, vec3 lim){
//   return p - s * clamp(round(p / s), -lim, lim);
// }

vec3 opRep(vec3 p, float s) {
  return mod(p + s * 0.5, s) - s * 0.5;
}

float sdScene(vec3 pos) {
  // return sdUnion(
  //   sdSphere(pos + vec3(1.0, 0.0, 0.0), 1.0),
  //   sdSphere(pos - vec3(1.0, 0.0, 0.0), 1.0)
  // );
  // vec3 lim = vec3(5.0, 5.0, 5.0);
  return sdUnion(
    sdSphere(opRep(pos, 2.0 + sin(0.1 * iTime)), 0.25 + 0.1 * sin(2.0 * iTime)),
    sdTorus(opRep(pos, 2.0), vec2(0.25, 0.15))
  );
  // return sdSphere(opRepLim(pos, 2.0, lim), 0.1);
}


float castRay(vec3 origin, vec3 dir) {
  float depth = MIN_DIST;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    float dist = sdScene(origin + depth * dir);
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
  vec2 result = 2.0 * (fragCoord / RESOLUTION - 0.5);
  result.x *= RESOLUTION.x / RESOLUTION.y;
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
  float dist = sdScene(pos);
  vec2 offset = vec2(0.001, 0.0);
  return normalize(vec3(
    sdScene(pos + offset.xyy),
    sdScene(pos + offset.yxy),
    sdScene(pos + offset.yyx)
  ) - dist);
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

vec3 render(vec3 origin, vec3 dir) {
  float depth = castRay(origin, dir);
  vec3 pos = origin + depth * dir;

  vec3 color;
  if (depth == MAX_DIST) {
    color = vec3(0.1, 0.2, 0.3) + (dir.y * 0.75);
  } else {
    // vec3 normal = estimateNormal(origin * dir);
    // color = normal * vec3(0.5) + vec3(0.5);
    color = lambertIllumination(vec3(0.35, 0.5, 0.75), pos, origin);
    color = applyFog(color, depth);
  }

  return color;
}

void main(){
  vec3 cameraTarget = cameraPos + vec3(cameraDir.x, cameraDir.y, cameraDir.z);
  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy);
  vec3 rayDirection = getRayDirection(uv, cameraPos, cameraTarget);

  vec3 final = render(cameraPos, rayDirection);

  gl_FragColor = vec4(final, 1.0);
}
