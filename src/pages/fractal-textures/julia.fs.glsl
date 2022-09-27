precision highp float;

uniform float iTime;
uniform vec2 iResolution;

const int MAXSTEPS = 30;
const float PI = 3.141592653589793238462643383279502884197169399375105;

mat4 rotateZ(float theta){
  float c = cos(theta);
  float s = sin(theta);
  return mat4(
    vec4(c, s, 0, 0),
    vec4(-s, c, 0, 0),
    vec4(0, 0, 1, 0),
    vec4(0, 0, 0, 1)
  );
}

vec4 julia(vec2 c){
  vec2 z = c;
  float a = PI + (sin(iTime/7.0) + 1.0) / 2.0 * 0.5;
  float r = 1.0;
  for (int i = 0; i < MAXSTEPS; i += 1) {
    float x = pow(z.x, 2.0) - pow(z.y, 2.0) + r * cos(a);
    float y = 2.0 * z.y * z.x + r * sin(a);
    if ((x*x + y*y) > 4.0) {
      return vec4(
        0.0,
        (sin(float(i)/float(MAXSTEPS)) + 1.0) / 2.25,
        (sin(float(i)/float(MAXSTEPS)) + 1.0) / 2.0,
        1.0
      );
    }
    z.x = x;
    z.y = y;
  }
  return vec4(0.0, 0.0, 0.0, 0.0);
}

const vec2 target = vec2(
  0.0,
  0.0
);

void main(){
  vec2 st = gl_FragCoord.xy / iResolution.xy;
  st *= (1.0, iResolution.x/iResolution.y);
  float zoom = 1.25;
  float xoff = ((st.x * 2.0 - 1.0) / zoom) + target.x;
  float yoff = ((st.y * 2.0 - 1.0) / zoom) + target.y;
  vec2 c = vec2(xoff, yoff);
  vec4 color = julia((vec4(c, 1.0, 1.0) * rotateZ(iTime/20.0)).xy);
  gl_FragColor = color;
}
