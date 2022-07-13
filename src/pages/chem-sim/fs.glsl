uniform sampler2D u_position;
uniform vec2 u_resolution;
uniform vec2 u_data_resolution;
uniform float u_time;
uniform vec3 u_camera_direction;
uniform vec3 u_camera_position;

varying vec2 texCoord;
varying vec2 vUv;

const int MAX_MARCHING_STEPS = 250;
const float MIN_DIST = 0.0;
const float MAX_DIST = 1000.0;
const float EPSILON = 0.0005;

float sphereSD(vec3 pos, float rad) {
  return length(pos) - rad;
}

vec2 normalizeScreenCoords(vec2 fragCoord, vec2 resolution) {
  vec2 result = 2.0 * (fragCoord / resolution - 0.5);
  result.x *= resolution.x / resolution.y;
  return result;
}

float smin(float a, float b, float k)
{
  float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
  return mix( b, a, h ) - k*h*(1.0-h);
}

vec4 scene(vec3 pos) {

  vec4 res = vec4(MAX_DIST);

  // mat3 test = u_position * vec2(2.0);

  // slightly faster than the single loop below
  // possibly due to the casting?
  for (int i=0; i < int(u_data_resolution.x); i+=1) {
    for (int j=0; j < int(u_data_resolution.y); j+=1) {
      vec2 dataUv = vec2(float(i)/u_data_resolution.x, float(j)/u_data_resolution.y);
      vec4 sampledPos = texture2D(u_position, dataUv);
      vec3 spos = pos + sampledPos.xyz;
      vec4 sphere = vec4(sphereSD(spos, 0.05), vec3(0.0, dataUv.x, sampledPos.z));
      // if (res.x > sphere.x) {
      //   res = sphere;
      // }
      // didn't make much of a difference
      // res = min(res, sphere);

      if (res.x > sphere.x) {
        res.yzw = sphere.yzw;
      }
      res.x = smin(res.x, sphere.x, 0.1);
    }
  }

  // for (int i=0; i < int(u_data_resolution.x * u_data_resolution.y); i+=1) {
  //   vec2 dataUv = vec2(
  //     floor(float(i)/u_data_resolution.x)/u_data_resolution.x,
  //     mod(float(i), u_data_resolution.x)/u_data_resolution.y
  //   );
  //   vec4 sampledPos = texture2D(u_position, dataUv);
  //   vec3 spos = pos + sampledPos.xyz;
  //   vec4 sphere = vec4(sphereSD(spos, 0.125), vec3(0.0, dataUv.x, sampledPos.z));
  //   if (res.x > sphere.x) {
  //     res.yzw = sphere.yzw;
  //   }
  //   res.x = smin(res.x, sphere.x, 0.1);
  // }

  // for (int i=0; i < int(u_data_resolution.x); i+=1) {
  //   for (int j=0; j < int(u_data_resolution.y); j+=1) {
      // vec2 dataUv = vec2(float(i)/u_data_resolution.x, float(j)/u_data_resolution.y);
      // vec2 dataUv = normalizeScreenCoords(gl_FragCoord.xy, u_resolution);
      // vec4 sampledPos = texture2D(u_position, vec2(dataUv.x / u_data_resolution.x, dataUv.y / u_data_resolution.y));
      // vec3 spos = pos + sampledPos.xyz;
      // vec4 sphere = vec4(sphereSD(spos, 0.025), vec3(0.0, dataUv.x, dataUv.y));
      // if (res.x > sphere.x) {
      //   res = sphere;
      // }
    // }
  // }

  // res = sphere;

  // vec2 dataUv = vec2(0.0/u_data_resolution.x, 0.0/u_data_resolution.y);
  // vec2 dataUv = gl_FragCoord.xy / u_resolution;
  // vec4 sampledPos = texture2D(u_position, dataUv);
  // vec3 spos = pos - sampledPos.xyz;
  // spos.y = 0.0;
  // vec4 sphere = vec4(sphereSD(spos, 0.025), vec3(0.0, 1.0, 0.0));

  // vec4 sampledPos2 = texture2D(u_position, vec2(1.0, 0.0));
  // vec3 spos2 = pos + sampledPos2.xyz;
  // vec4 s2 = vec4(sphereSD(spos2, 0.025), vec3(0.0, 1.0, 0.0));

  // vec4 res = sphere;
  // if (res.x > s2.x) { res = s2; }

  return res;
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

vec3 getRayDirection(vec2 uv, vec3 origin, vec3 target, float fov) {
  vec3 forward = normalize(target - origin);
  vec3 right = -1.0 * normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = -1.0 * normalize(cross(forward, right));
  return normalize(uv.x * right + uv.y * up + forward * fov);
}

void main() {
  vec3 camPos = u_camera_position;
  // vec3 camPos = vec3(0.0, 0.0, 150.0);
  vec3 camDir = u_camera_direction;
  vec3 camTarget = camPos + camDir;
  // vec3 camTarget = vec3(0.0, 0.0, 0.0);
  // float camFov = iCameraFov;
  float camFov = 90.0;

  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy, u_resolution);
  vec3 rayDir = getRayDirection(uv, camPos, camTarget, camFov);
  vec4 result = trace(camPos, rayDir);
  vec3 color = result.yzw;

  if (result.x == MAX_DIST) {
    color = vec3(0.0);
    return;
  }

  color.b += gl_FragCoord.y/u_resolution.y;

  gl_FragColor = vec4(color, 1.0);
  // gl_FragColor = vec4(uv.x, 0.0, 0.0, 1.0);
}
