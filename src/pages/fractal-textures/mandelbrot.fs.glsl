precision highp float;

uniform float iTime;
uniform vec2 iResolution;

const int MAXSTEPS = 160;

vec4 mandelbrot(vec2 c){
  vec2 z = c;
  for (int i = 0; i < MAXSTEPS; i += 1) {
    float x = z.x * z.x - z.y * z.y + c.x;
    float y = 2.0 * z.y * z.x + c.y;
    if ((x*x + y*y) > 4.0) {
      return vec4(
        0.0,
        (cos(float(i) - iTime) + 1.0) / 2.5,
        (sin(float(i) - iTime) + 1.0) / 2.25,
        1.0
      );
    }
    z.x = x;
    z.y = y;
  }
  return vec4(0.0, 0.0, 0.0, 0.0);
}

const vec2 target = vec2(
  -0.743643887037158704752191506114774,
  0.131825904205311970493132056385139
);

void main(){
  vec2 st = gl_FragCoord.xy / iResolution.xy;
  float zoom = pow(mod(iTime, 60.0) / 2.0, 3.0);
  float xoff = ((st.x * 2.0 - 1.0) / zoom) + target.x;
  float yoff = ((st.y * 2.0 - 1.0) / zoom) + target.y;
  vec2 c = vec2(xoff, yoff);
  vec4 color = mandelbrot(c);
  gl_FragColor = color;
}
