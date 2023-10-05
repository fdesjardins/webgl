#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 iResolution;
uniform float iTime;
uniform vec3 iCameraPosition;

float PI = 3.14159265;
float H = 6.62607015e-34;
float E = 2.71828182845905;
float M = 1.0;

vec2 I = vec2(0.0, 1.0);

float GRID_SIZE = 0.25;

float grid(vec2 st, float grid_size){
  return smoothstep(0.005, 0.0, mod(abs(st.x), grid_size))+
         smoothstep(0.005, 0.0, mod(abs(st.y), grid_size));
}

float plot(vec2 st, float y){
  return smoothstep(y-0.03, y,      st.y) -
         smoothstep(y,      y+0.03, st.y);
}

float k_n(float n, float l){
  return (n + 1.0) * PI / l;
}

float w_n(float n, float l){
  return ((n, 2.0) * pow(PI, 2.0) * H) / (2.0 * M * pow(l, 2.0));
}

vec2 psi(float n, float t, float x){
  x = clamp(x, 0.0, 1.0);
  float l = 1.0;
  float c = sin(k_n(n, l) * ((x-0.5)+(l/2.0)));
  return vec2(
    c * cos(M * t),
    c * sin(M * t)
  );
}

void main(){
  vec2 st = gl_FragCoord.xy / iResolution;

  st = st*2.0 - vec2(1.0);
  st.y *= 2.0;
  float time = iTime * 2.0;

  st.x += (0.5 / -iCameraPosition.z);
  st *= -iCameraPosition.z;

  vec2 z = (psi(0.0, time, st.x)) / sqrt(1.0);
  float y = z.x;

  vec3 color = vec3(0.1, 0.1, 0.15);

  {
    float g = grid(st, GRID_SIZE);
    color = (1.0-g)*color + g*vec3(0.2);
  }
  {
    float g = grid(st, 1.0);
    color = (1.0-g)*color + g*vec3(0.2, 0.4, 0.6);
  }

  float pct = plot(st, y);
  color = (1.0-pct)*color + pct*vec3(0.0, 1.0, 0.0);

  // float y2 = sin(st.x*4.0 - time)*0.5;
  float pct2 = plot(st, z.y);
  color = (1.0-pct2)*color + pct2*vec3(1.0, 0.0, 0.0);

  gl_FragColor = vec4(color, 1.0);
}
