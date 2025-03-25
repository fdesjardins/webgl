uniform vec2 iResolution;
uniform float iTime;
uniform vec3 iCameraPosition;

// http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(vec2 co)
{
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt= dot(co.xy ,vec2(a,b));
  highp float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}

float vnoise(vec2 p) {
  vec2 s = floor(p);
  vec2 t = fract(p);
  // vec2 u = t * t * (3.0 - 2.0*t);
  vec2 u = t;
  return mix(
    mix(rand(s + vec2(0.0, 0.0)),
        rand(s + vec2(1.0, 0.0)),
        u.x),
    mix(rand(s + vec2(0.0, 1.0)),
        rand(s + vec2(1.0, 1.0)),
        u.x),
    u.y);
}

vec2 rand2d(vec2 p) {
  float r = rand(p);
  return vec2(r, rand(vec2(r)));
  // return vec2(cos(rand(p)), sin(rand(vec2(rand(p)))));
}

float terp(float a, float b, float w) {
  // return (b - a) * (3.0 - w * 2.0) * w * w + a;
  return (b - a) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a;
}
// perlin noise
float noise(vec2 p) {
  vec2 xy0 = floor(p);
  vec2 xy1 = xy0 + vec2(1.0);
  vec2 s = p - xy0;
  // vec2 s = fract(p);
  vec2 g0 = rand2d(xy0);
  vec2 g1 = rand2d(vec2(xy1.x, xy0.y));
  vec2 g2 = rand2d(vec2(xy0.x, xy1.y));
  vec2 g3 = rand2d(xy1);
  float n0 = dot(p-xy0, g0);
  float n1 = dot(p-vec2(xy1.x, xy0.y), g1);
  float n2 = dot(p-vec2(xy0.x, xy1.y), g2);
  float n3 = dot(p-xy1, g3);

  // vec2 fadeXY = fade(s);
  // vec2 nX = mix(vec2(n0,n1), vec2(n2,n3), fadeXY.x);
  // float nXY = mix(nX.x, nX.y, fadeXY.y);
  // float ret = nXY;

  float ix0 = mix(n0,n1,s.x);
  float ix1 = mix(n2,n3,s.x);
  float ret = mix(ix0,ix1,s.y);
  // scale from -1-1 to 0-1
  // return ret*0.5+0.5;
  ret += 0.5;
  return ret*ret*(3.0-2.0*ret);
}

vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 *
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return (n_xy+0.5);
  // return n_xy*2.0+0.3;
}

vec2 normalizeScreenCoords(vec2 fragCoord, vec2 resolution) {
  vec2 result = 2.0 * (fragCoord / resolution - 0.5);
  result.x *= resolution.x / resolution.y;
  return result;
}

float fbmValue(vec2 uv) {
  // Here we construct a rotation matrix using Pythagorean
  // triples to avoid using sin and cos
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6); // 3,4,5
  float f = 0.0;
  f = 0.5      * vnoise(uv); uv *= m;
  f += 0.25    * vnoise(uv); uv *= m;
  f += 0.125   * vnoise(uv); uv *= m;
  f += 0.0625  * vnoise(uv); uv *= m;
  f += 0.03125 * vnoise(uv); uv *= m;
  return f;
}

float fbmPerlin(vec2 uv) {
  // Here we construct a rotation matrix using Pythagorean
  // triples to avoid using sin and cos
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6); // 3,4,5
  float f = 0.0;
  f = 0.5      * cnoise(uv); uv *= m;
  f += 0.25    * cnoise(uv); uv *= m;
  f += 0.125   * cnoise(uv); uv *= m;
  f += 0.0625  * cnoise(uv); uv *= m;
  f += 0.03125 * cnoise(uv); uv *= m;
  return f;
}

void main() {
  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy, iResolution);
  vec2 uv1 = uv;
  uv.x += 3.0 * sin(iTime / 24.0);
  uv.y += 3.0 * cos(iTime / 24.0);
  uv *= 12.0 + 5.0 * sin(iTime / 8.0);

  float f;
  if (uv1.x < 0.0) {
    f = cnoise(uv);
  } else {
    f = fbmPerlin(uv);
  }

  vec3 color = vec3(f);

  gl_FragColor = vec4(color, 1.0);
}
