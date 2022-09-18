precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;
uniform float iCameraFov;

const int MAX_MARCHING_STEPS = 300;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.008;

float sphereSD(vec3 pos, float rad) {
  return length(pos) - rad;
}

float surfaceSD(vec3 pos) {
  return pos.y - cos(pos.x) - sin(pos.z);
}

float planeSD(vec3 pos, float y) {
  return pos.y - y;
}

vec4 scene(vec3 pos) {
  if (abs(pos.x) > 20.0 || abs(pos.z) > 20.0) {
    return vec4(MAX_DIST);
  }
  vec3 col = vec3(1.0, 0.5, 0.0);
  float d = MAX_DIST;
  // d = sphereSD(pos, 0.5);
  d = planeSD(
    vec3(pos.x, pos.y + sin(pos.x + iTime) + cos(pos.z), pos.z),
    -2.0
  );
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
    if (dist <= EPSILON) {
      return vec4(depth, drgb.yzw);
    }
    depth += dist * 0.5;
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

  vec3 lightPosition = vec3(4.0 * sin(iTime), 2.0, 4.0 * cos(iTime));
  vec3 lightIntensity = vec3(0.5, 0.5, 0.5);

  color += calcPhong(k_d, k_s, alpha, p, eye, lightPosition, lightIntensity);

  return color;
}

vec3 lambert(vec3 color, vec3 pos, vec3 eye) {
  vec3 ambientLight = 0.35 * vec3(1.0, 1.0, 1.0);
  vec3 diffuse = ambientLight * color;

  // vec3 lightPos = vec3(4.0 + sin(iTime), 2.0, 4.0 + cos(iTime));
  vec3 lightPos = vec3(5.0, 5.0, 5.0);
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

void main() {
  vec3 camPos = iCameraPosition;
  vec3 camDir = iCameraDirection;
  vec3 camTarget = camPos + camDir;
  float camFov = iCameraFov;

  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy, iResolution);
  vec3 rayDir = getRayDirection(uv, camPos, camTarget, camFov);

  // sky color
  vec3 color = vec3(0.0);
  // color += vec3(0.5, 0.7, 1.0) * (rayDir.y*2.0);

  vec4 result = trace(camPos, rayDir);
  if (result.x < MAX_DIST) {
    // color = result.yzw * lambert(vec3(1.0), camPos + rayDir * result.x, camPos);
    // color = result.yzw * phongIllumination(
    //     vec3(0.6),
    //     vec3(0.8),
    //     vec3(0.6),
    //     1.0,
    //     rayDir * result.x,
    //     camPos
    // );
    color = result.yzw * lambert(vec3(1.0), camPos + rayDir * result.x, camPos);
  }

  if (result.x == MAX_DIST) {
    color = vec3(0.0);
  }

   // gamma correction
  // color.xyz = pow(vec4(color, 1.0), vec4(1.0/2.2)).xyz;

  gl_FragColor = vec4(color, 1.0);
}
