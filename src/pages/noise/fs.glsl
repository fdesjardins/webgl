uniform vec2 iResolution;
uniform float iTime;
uniform vec3 iCameraPosition;

float rand2(vec2 p) {
  // return -1.0 + 2.0 * fract(sin(dot(p.xy, vec2(12.1718, 33.4617))) * 4543000.0);

  p  = 50.0*fract( p*0.3183099 + vec2(0.71,0.113));
  return -1.0+2.0*fract( p.x*p.y*(p.x+p.y) );

  // float h = dot(p,vec2(127.1,311.7));
  // return -1.0+2.0*fract(sin(h)*43758.5453123);
}

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

uint murmur(uint x) {
  x ^= x >> 16;
  x *= 0x85ebca6bU;
  x ^= x >> 13;
  x *= 0xc2b2ae35U;
  x ^= x >> 16;
  return x;
}

// Credit: Chris Wellons
uint lowbias32(uint x) {
  x ^= x >> 16;
  x *= 0x7feb352dU;
  x ^= x >> 15;
  x *= 0x846ca68bU;
  x ^= x >> 16;
  return x;
}

float rand3(vec2 p) {
  uint seed = uint(p.x) + lowbias32(uint(p.y));
  uint hash = lowbias32(seed);
  return -1.0 + 2.0 * (float(hash) / float(0xFFFFFFFFU));
}

float noise(vec2 p) {
  vec2 s = floor(p);
  vec2 t = fract(p);
  vec2 u = t * t * (3.0 - 2.0*t);
  return mix(
    mix(rand(s + vec2(0.0, 0.0)),
        rand(s + vec2(1.0, 0.0)),
        u.x),
    mix(rand(s + vec2(0.0, 1.0)),
        rand(s + vec2(1.0, 1.0)),
        u.x),
    u.y);
}

void main() {
  vec2 p = gl_FragCoord.xy / iResolution.xy;
  float zoom = -1.0 * iCameraPosition.z;
  p += iCameraPosition.xy * vec2(-1.0, 1.0);
  vec2 uv = p * vec2(iResolution.x/iResolution.y, 1.0);

  float f = 0.0;

  uv.x += 3.0 * sin(iTime / 8.0);
  uv.y += 3.0 * cos(iTime / 8.0);
  uv *= 24.0 + 10.0 * sin(iTime / 3.0);

  // f(p_xz) = N(p_xz)
  // 1/2 * N(2 * M * p_xz)

  // Here we construct a rotation matrix using Pythagorean
  // triples to avoid using sin and cos
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6); // 3,4,5

  f = 0.5     * noise(uv); uv *= m;
  f += 0.25   * noise(uv); uv *= m;
  f += 0.125  * noise(uv); uv *= m;
  f += 0.0625 * noise(uv); uv *= m;

  f = 0.5 * (0.5 + f);

  gl_FragColor = vec4(vec3(f), 1.0);
}
