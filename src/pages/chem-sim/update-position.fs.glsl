uniform sampler2D u_position;
uniform vec2 u_data_resolution;
uniform float u_time;

vec2 normalizeScreenCoords(vec2 fragCoord, vec2 resolution) {
  vec2 result = 2.0 * (fragCoord / resolution - 0.5);
  result.x *= resolution.x / resolution.y;
  return result;
}

void main(){
  // vec2 uv = gl_FragCoord.xy / u_data_resolution.xy;
  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy, u_data_resolution.xy);
  vec4 pos = texture2D(u_position, uv);
  // if (uv.x == 0.1) {
  // pos.y = 0.05 * sin(u_time);
  // }
  // pos.x = uv.x + sin(u_time) * uv.y;
  // pos.x = -uv.x;
  pos.x = uv.x;
  pos.y = uv.y;

  // if (pos.x > 0.0) {
  pos.y += sin(u_time) * 0.5 * pos.x;
  pos.x += sin(u_time * pos.y) * 0.1;
  pos.z = pos.x;
  // }
  // pos.x = gl_FragCoord.x;
  // pos.y = gl_FragCoord.y;
  // pos.y = -uv.y;
  // pos.y = uv.y * cos(u_time) * uv.x;
  // pos.z = 10.0 * (pos.x + 1.0);

  gl_FragColor = pos;
}
