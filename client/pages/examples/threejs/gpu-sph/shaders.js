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

const constants = `
float H = 1.0;
float PI = 3.14159265359;
float GAS_CONST = 100.0;
float REST_DENSITY = 100.0;
float VISCOSITY = 40.0;
vec3 G = vec3(0.0, -9.8, 0.0);
float MASS = 0.00025;
float PARTICLE_SIZE = 7.0;
float WORLD_SIZE = 6.0;`

const uniforms = `
uniform sampler2D u_position;
uniform sampler2D u_velocity;
uniform sampler2D u_last_position;
uniform sampler2D u_force;
uniform sampler2D u_density_pressure;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_delta;`

export const updateDP = `
${constants}
${uniforms}

float poly6f(float d, float h){
  if (d > 0.0 && d < h) {
    return (315.0 / (64.0 * pow(h, 9.0) * PI)) * pow((pow(h, 2.0) - pow(d, 2.0)), 3.0);
  }
  return 0.0;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec4 pos = texture2D(u_position, uv);
  float density = 0.0;
  for (float x = 0.0; x < u_resolution.x; x += 1.0) {
    for (float y = 0.0; y < u_resolution.y; y += 1.0) {
      vec4 pos2 = texture2D(u_position, vec2(x,y)/u_resolution.xy);
      float dist = distance(pos2, pos);
      if (dist < H && dist > 0.0) {
        density += MASS * poly6f(dist, H);
      }
    }
  }
  float pressure = GAS_CONST * (density - REST_DENSITY);
  gl_FragColor = vec4(density, pressure, 0.0, 0.0);
}`

export const updateF = `
${constants}
${uniforms}

float visc(float dist, float h){
  return 45.0 / (PI * pow(h, 6.0));
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec4 pos = texture2D(u_position, uv);
  vec4 vel = texture2D(u_velocity, uv);
  vec4 dp = texture2D(u_density_pressure, uv);
  vec3 pressure = vec3(0.0);
  vec3 viscosity = vec3(0.0);
  for (float x = 0.0; x < u_resolution.x; x += 1.0) {
    for (float y = 0.0; y < u_resolution.y; y += 1.0) {
      vec4 pos2 = texture2D(u_position, vec2(x,y)/u_resolution.xy);
      float dist = distance(pos, pos2);
      if (dist < H && dist > 0.0) {
        vec4 dp2 = texture2D(u_density_pressure, vec2(x,y)/u_resolution.xy);
        vec4 vel2 = texture2D(u_velocity, vec2(x,y)/u_resolution.xy);
        pressure += normalize(pos2.xyz - pos.xyz) * (-1.0 * (dp.x + dp2.x)) / 2.0;
        viscosity += (vel2.xyz - vel.xyz) * ((VISCOSITY * MASS) / dp2.y) * visc(dist, H) * (H - dist);
      }
    }
  }
  gl_FragColor = vec4(G + pressure + viscosity, 0.0);
}`

export const updatePos = `
${constants}
${uniforms}

varying vec2 vUv;

${rotate2d}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec4 pos = texture2D(u_position, uv);
  // vec4 lastpos = texture2D(u_last_position, uv);
  vec4 vel = texture2D(u_velocity, uv);
  // vec4 f = texture2D(u_force, uv);

  // Euler method
  pos += vel * u_delta;

  // Verlet method
  // pos = pos * 2.0 - lastpos + f * pow(u_delta, 2.0);

  // Boundary conditions
  float bound = WORLD_SIZE / 2.0;
  if (pos.x >  bound) { pos.x =  bound; }
  if (pos.x < -bound) { pos.x = -bound; }
  if (pos.y >  bound) { pos.y =  bound; }
  if (pos.y < -bound) { pos.y = -bound; }
  if (pos.z >  bound) { pos.z =  bound; }
  if (pos.z < -bound) { pos.z = -bound; }

  float t = atan(u_time + uv.x) + tan(u_time + uv.y);
  if (t > -0.001 && t < 0.001) {
    pos.xyz = vec3(0.0);
  }

  gl_FragColor = pos;
}`

export const updateVel = `
${constants}
${uniforms}

${rotate2d}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec4 pos = texture2D(u_position, uv);
  // vec4 lastpos = texture2D(u_last_position, uv);
  vec4 vel = texture2D(u_velocity, uv);
  vec4 f = texture2D(u_force, uv);

  // From boundary condition
  if (pos.xyz == vec3(0.0)) {
    vel.y = sin(u_time) + 3.0;
    vel.x = sin(u_time/32.0 + uv.x);
    vel.z = -sin(u_time/32.0 + uv.y);
  }

  float bound = WORLD_SIZE / 2.0;
  if (abs(pos.x) == bound) { vel.x *= -0.1; }
  if (abs(pos.y) == bound) { vel.y *= -0.1; }
  if (abs(pos.z) == bound) { vel.z *= -0.1; }

  // Euler method
  vel += f * u_delta;

  // vel += (pos - lastpos) / (2.0 * u_delta);
  // vel = vec4(0.0, 0.0, 0.0, 0.0);

  gl_FragColor = vel;
}`

export const drawVs = `
${constants}
${uniforms}

varying vec2 vUv;

void main(){
  vUv = uv;
  vec4 pos = texture2D(u_position, uv);
  vec4 dp = texture2D(u_density_pressure, uv);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz, 1.0);
  gl_PointSize = PARTICLE_SIZE + dp.x * 300.0;
}`

export const drawFs = `
${uniforms}

varying vec2 vUv;

void main(){
  float distance = length(2.0 * gl_PointCoord - 1.0);
  if (distance > 1.0) {
    discard;
  }
  vec4 dp = texture2D(u_density_pressure, vUv);
  vec4 vel = texture2D(u_velocity, vUv);
  gl_FragColor = vec4(
    0.8 - dp.x * 40.0 + length(vel)/30.0,
    0.9 - dp.x * 20.0 + length(vel)/30.0,
    1.0 - dp.x * 10.0 + length(vel)/30.0,
    0.0);
}
`
