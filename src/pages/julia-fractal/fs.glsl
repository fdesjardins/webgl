varying vec2 vUv;
const int MAXSTEPS = 400;
const float PI = 3.141592653589793238462643383279502884197169399375105;
uniform float iTime;
uniform vec3 iCameraPosition;

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

mat4 rotateY(float theta){
  float c = cos(theta);
  float s = sin(theta);
  return mat4(
    vec4(c, 0, s, 0),
    vec4(0, 1, 0, 0),
    vec4(-s, 0, c, 0),
    vec4(0, 0, 0, 1)
  );
}

vec4 julia(vec2 c){
  vec2 z = c;
  float a = PI;
  float r = 1.25;
  for (int i = 0; i < MAXSTEPS; i += 1) {
    float x = pow(z.x, 2.0) - pow(z.y, 2.0) + r * cos(a);
    float y = 2.0 * z.y * z.x + r * sin(a);
    if ((x*x + y*y) > 4.0) {
      return vec4(
        0.2,
        (sin(float(i * int(iTime * 50.0))/float(MAXSTEPS)) + 1.0) / 2.0,
        0.9,
        1.0
      );
    }
    z.x = x;
    z.y = y;
  }
  return vec4(0.0, 0.0, 0.0, 0.0);
}

const vec2 target = vec2(
  0.25,
  0.0
);

void main(){
  vec3 camPos = iCameraPosition;
  float zoom = 0.25 + (sin(iTime/10.0) + 1.0);
  float xoff = ((vUv.x * 2.0 - 1.0) / zoom) + target.x;// + camPos.x/pow(zoom, 3.0);
  float yoff = ((vUv.y * 2.0 - 1.0) / zoom) + target.y;// + camPos.y/pow(zoom, 3.0);
  vec2 c = vec2(xoff, yoff);
  c = (vec4(c, 1.0, 1.0) * rotateZ(iTime/10.0)).xy;

  vec4 color = julia(vec4(c, 1.0, 1.0).xy);// * rotateZ(iTime/10.0)).xy);
  gl_FragColor = color;
}
