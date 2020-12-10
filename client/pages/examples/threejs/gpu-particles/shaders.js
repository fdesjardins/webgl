export const vs = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
}`

const rotate2d = `
mat2 rotate2d(float theta){
  return mat2(cos(theta), -sin(theta),
              sin(theta),  cos(theta));
}`

const scale2d = `
mat2 scale(float sx, float sy){
  return mat2(1.0/sx, 0.0,
              0.0,    1.0/sy);
}`

export const updatePos = `
uniform sampler2D u_position;
uniform sampler2D u_velocity;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_delta;

varying vec2 vUv;

${rotate2d}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec4 pos = texture2D(u_position, uv);
  vec4 vel = texture2D(u_velocity, uv);

  pos += vel * u_delta;
  pos.xz *= rotate2d((uv.y + uv.x) * sin(u_time/2.0) / 32.0);
  pos.yz *= rotate2d((uv.y + uv.x) * cos(u_time/2.0) / 32.0);

  if (abs(pos.x) > 3.0 || abs(pos.y) > 3.0 || abs(pos.z) > 3.0) {
    pos.xyz = vec3(0.0, 0.0, 0.0);
  }

  gl_FragColor = pos;
}`

export const updateVel = `
uniform sampler2D u_position;
uniform sampler2D u_velocity;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_delta;

${rotate2d}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec4 pos = texture2D(u_position, uv);
  vec4 vel = texture2D(u_velocity, uv);

  if (pos.xyz == vec3(0.0)) {
    vel.y = sin(u_time) + 2.0;
    vel.x = sin(u_time + uv.x);
    vel.z = cos(u_time + uv.y);
  }

  vel += vec4(0.0, -2.0, 0.0, 0.0) * u_delta;
  vel.xz *= rotate2d((uv.y + uv.x) * sin(u_time/2.0) / 32.0);

  gl_FragColor = vel;
}`

export const drawVs = `
uniform sampler2D u_position;
uniform vec2 u_statesize;
uniform vec2 u_scale;
uniform vec2 u_world_size;

varying vec2 vUv;

void main(){
  vUv = uv;
  vec4 pos = texture2D(u_position, uv);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz, 1.0);
  gl_PointSize = uv.x * 2.0;
}`

export const drawFs = `
varying vec2 vUv;
void main(){
  gl_FragColor = vec4(1.0 - vUv.x, 1.0 - vUv.y, 1.0, 1.0);
}
`
