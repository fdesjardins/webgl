export const vs = `
varying vec2 texCoord;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
  texCoord = vec2(gl_Position.x, gl_Position.y);
}`

export const fs = `
varying vec2 texCoord;
uniform float iTime;
uniform sampler2D u_texture;
varying vec2 vUv;

void main(){
  gl_FragColor = texture2D(u_texture, vUv);
}`

const encode = `
vec2 encode(float value, float scale) {
  value = value * scale + OFFSET;
  float x = mod(value, BASE);
  float y = floor(value / BASE);
  return vec2(x, y) / BASE;
}`

const decode = `
float decode(vec2 channels, float scale) {
  return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}`

export const update = `
uniform sampler2D u_position;
uniform vec2 u_world_size;
uniform vec2 u_scale;
varying vec2 v_index;

const float BASE = 255.0;
const float OFFSET = BASE * BASE / 2.0;

${decode}
${encode}

void main(){
  vec4 posData = texture2D(u_position, index);
  vec2 pos = vec2(decode(posData.rg, scale.x), decode(posData.ba, scale.x));

  if (pos.x > 0.0 && pos.y > 0.0) {
    pos += vec2(0.0, 0.0);
  }

  gl_FragColor = vec4(encode(pos.x, scale.x), encode(pos.y, scale.x));
}
`
