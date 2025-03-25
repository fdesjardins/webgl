uniform float iTime;
uniform vec2 iResolution;

const int MAXSTEPS = 50;
const float MAXTIME = 60.0;

vec4 mandelbrot(vec2 c){
  vec2 z = c;
  float zoom = pow(mod(1.5+iTime, MAXTIME)*2.0, (sin(iTime)*.5+1.)*.03+.94);
  for (int i = 0; i < MAXSTEPS + int(zoom); i += 1) {
    float x = z.x * z.x - z.y * z.y + c.x;
    float y = 2.0 * z.y * z.x + c.y;
    float bail = pow(2.0, 10.0);
    if ((x*x + y*y) > bail) {
      float sval = float(i) - log2(log2(dot(z,z))/log2(bail))/log2(2.0);
      float smov = sin(pow(sval,1.) - iTime);

      if (mod(abs(smov), 1.) <= .1) {
        return vec4(0.,0.,0.,1.);
      }

      if (mod(abs(smov), 1.) <= .5) {
        return (abs(mod(abs(smov), float(i)))+0.5) * vec4(0.0, 0.5, 0.5, 1.);
      }
      else if (mod(abs(smov), 1.) <= .9) {
        return (abs(mod(smov, 1.0))*0.5+0.5) * vec4(0.0, 1.0, 0., 1.);
      }
      return (abs(mod(smov, 1.0))*0.5+0.5) * vec4(0.0, 0.0, 1.0, 1.);
    }
    z.x = x;
    z.y = y;
  }
  return vec4(0.0, 0.0, 0.0, 1.0);
}

const vec2 target = vec2(
  -0.743643887037158704752191506114774,
  0.131825904205311970493132056385139
);

void main(){
  vec2 st = (gl_FragCoord.xy - iResolution.xy*.5)/iResolution.y+.5;
  float zoom = pow(mod(1.75+iTime, MAXTIME) / 2.0, 3.0);
  float xoff = ((st.x * 2.0 - 1.0) / zoom) + target.x;
  float yoff = ((st.y * 2.0 - 1.0) / zoom) + target.y;
  vec4 color = vec4(0.0);
  for (int xj = 0; xj<2; xj++) {
    for (int yj = 0; yj<2; yj++) {
      vec2 c = vec2(xoff + float(xj-1)*0.0015/zoom, yoff + float(yj-1)*.0015/zoom);
      color += mandelbrot(c)/4.0;
    }
  }

  color.xyz = pow(vec4(color.xyz, 1.0), vec4(1.0/2.2)).xyz;

  gl_FragColor = color;
}
