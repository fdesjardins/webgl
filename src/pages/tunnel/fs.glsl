uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;
uniform float iCameraFov;
uniform sampler2D iChannel0;

const float PI = 3.141592;

vec4 render(vec3 p) {
  float a = atan(p.y, p.x);
  float r = sqrt(dot(p,p));

  float fogAmount = 0.3 + exp(-r * 3.0);
  vec4 fogColor = vec4(0.0,0.0,0.02,0.9);

  if (r < 0.05) {
    vec4 col = vec4(0.0);
    return mix(col, fogColor, fogAmount);
  }
  float time = iTime/4.0;
  vec2 uv = vec2(a/PI, time+(0.25/r));

  uv *= 1.5;
  uv.y = mod(uv.y, 1.0);
  uv.x = mod(uv.x, 1.0);

  vec4 col = vec4(texture(iChannel0, uv).xyz, 1.0);
  return mix(col, fogColor, fogAmount);
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

void main(){
  vec3 camPos = iCameraPosition;
  vec3 camDir = iCameraDirection;
  vec3 camTarget = camPos + camDir;
  float camFov = iCameraFov;

  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy, iResolution);
  vec3 ro = camPos;
  ro.x += 0.03*sin(iTime);
  ro.y += 0.07*cos(iTime);
  vec3 rd = getRayDirection(uv, ro, camTarget, camFov);

  vec4 color = render(ro+rd);

  gl_FragColor = color;
}
