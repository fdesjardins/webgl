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
float H = 3.0;
float PI = 3.14159265359;
float GAS_CONST = 100.0;
float REST_DENSITY = 200.0;
float VISCOSITY = 100.0;
vec3 G = vec3(0.0, -9.8, 0.0);
float MASS = 0.025;
float PARTICLE_SIZE = 0.1;
float WORLD_SIZE = 6.0;
vec3 SPAWN_POS = vec3(0.0, 1.0, 0.0);`

const uniforms = `
uniform sampler2D u_position;
uniform sampler2D u_velocity;
uniform sampler2D u_last_position;
uniform sampler2D u_force;
uniform sampler2D u_density_pressure;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_delta;`

export const updateDensity = `
${constants}
${uniforms}

float poly6(float r, float h){
  if (r >= 0.0 && r <= h) {
    return ( 315.0 / (64.0 * PI * pow(h, 9.0)) ) *
      pow((pow(h, 2.0) - pow(r, 2.0)), 3.0);
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
        density += MASS * poly6(dist, H);
      }
    }
  }
  float pressure = GAS_CONST * (density - REST_DENSITY);
  gl_FragColor = vec4(density, pressure, 0.0, 0.0);
}`

export const updatePressure = `
${constants}
${uniforms}

float spiky(float r, float h){
  if (r >= 0.0 && r <= h) {
    return 15.0/(PI*pow(h,6.0)) * pow(h - r, 3.0);
  }
  return 0.0;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  // vec4 pos = texture2D(u_position, uv);
  vec4 dp = texture2D(u_density_pressure, uv);

  // float pressure = 0.0;
  // for (float x = 0.0; x < u_resolution.x; x += 1.0) {
  //   for (float y = 0.0; y < u_resolution.y; y += 1.0) {
  //     vec4 pos2 = texture2D(u_position, vec2(x,y)/u_resolution.xy);
  //     float dist = distance(pos2, pos);
  //     if (dist < H && dist > 0.0) {
  //       vec4 dp_j = texture2D(u_density_pressure, vec2(x,y)/u_resolution.xy);
  //       pressure += (dp.y + dp_j.y)/(2.0 * dp_j.x) * spiky(dist, H);
  //     }
  //   }
  // }

  // gl_FragColor = vec4(dp.x, -0.5 * dp.x, 0.0, 0.0);
  gl_FragColor = vec4(dp.x, dp.y, 0.0, 0.0);
}`

export const updateF = `
${constants}
${uniforms}

float visc(float dist, float h){
  return 45.0 / (PI * pow(h, 6.0));
}

float visc2(float r, float h){
  if (r >= 0.0 && r <= h) {
    return 15.0/(2.0*PI*pow(h,3.0)) *
      ((-pow(r,3.0)/2.0*pow(h,3.0)) + (pow(r,2.0)/pow(h,2.0)) + (h/2.0*r) - 1.0);
  }
  return 0.0;
}

float spiky(float r, float h){
  if (r >= 0.0 && r <= h) {
    return 15.0/(PI*pow(h,6.0)) * pow(h - r, 3.0);
  }
  return 0.0;
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
        pressure += normalize(pos2.xyz - pos.xyz) * (-1.0 * (dp.x + dp2.x)) / 2.0 * spiky(dist, H);
        // pressure += normalize(pos2.xyz - pos.xyz) / (2.0 * dp2.y) * spiky(dist, H);
        // pressure += MASS * (dp.y + dp2.y) / (2.0 * dp2.x) * spiky(dist, H);
        viscosity += (vel2.xyz - vel.xyz) * ((VISCOSITY * MASS) / dp2.y) * visc2(dist, H) * (H - dist);
      }
    }
  }
  // pressure *= -1.0;
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
  if (pos.y >  3.0*bound) { pos.y =  3.0*bound; }
  if (pos.y < -bound) { pos.y = -bound; }
  if (pos.z >  bound) { pos.z =  bound; }
  if (pos.z < -bound) { pos.z = -bound; }

  float t = sin(u_time + 3.0 * uv.x + 2.0 * uv.y);
  if (u_time > 3.0 && abs(t) > 0.999995 && pos.y < -bound + 0.01) {
    pos.xyz = SPAWN_POS;
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
  if (pos.xyz == SPAWN_POS) {
    vel.x = sin(u_time*3.0) * 7.0;
    vel.z = cos(u_time*3.0) * 7.0;
    vel.y = 20.0;
  }

  float bound = WORLD_SIZE / 2.0;
  if (abs(pos.x) == bound) { vel.x *= -0.3; }
  if (pos.y == -bound
   || pos.y ==  bound*3.0) { vel.y *= -0.3; }
  if (abs(pos.z) == bound) { vel.z *= -0.3; }

  // Euler method
  vel += f * u_delta;

  // vel += (pos - lastpos) / (2.0 * u_delta);

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
  gl_PointSize = PARTICLE_SIZE + dp.x * 40.0;
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
    0.7 - dp.x * 1.5 + max(length(vel)/30.0, 0.2),
    0.8 - dp.x * 1.0 + max(length(vel)/30.0, 0.1),
    1.0 - dp.x * 0.5 + length(vel)/10.0,
    0.75 - dp.x * 0.25);
}
`
