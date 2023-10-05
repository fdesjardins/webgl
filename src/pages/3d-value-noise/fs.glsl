uniform float iTime;
uniform vec2 iResolution;

// http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(vec3 co)
{
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 400.23;
  highp float d = 43758.5453;
  highp float dt= dot(co.xyz ,vec3(a,b,c));
  highp float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}

float noise(vec3 p) {
  vec3 s = floor(p);
  vec3 t = fract(p);
  vec3 u = smoothstep(0.0, 1.0, t);

  return mix(
    mix(
      mix(rand(s + vec3(0.0, 0.0, 0.0)),
          rand(s + vec3(1.0, 0.0, 0.0)),
          u.x),
      mix(rand(s + vec3(0.0, 1.0, 0.0)),
          rand(s + vec3(1.0, 1.0, 0.0)),
          u.x),
      u.y),
    mix(
      mix(rand(s + vec3(0.0, 0.0, 1.0)),
          rand(s + vec3(1.0, 0.0, 1.0)),
          u.x),
      mix(rand(s + vec3(0.0, 1.0, 1.0)),
          rand(s + vec3(1.0, 1.0, 1.0)),
          u.x),
      u.y),
    u.z);
}

float fbm(vec3 pos) {
  float f = 0.0;

  // Here we construct a rotation matrix using Pythagorean
  // triples to avoid using sin and cos
  mat3 m = mat3(
    1.6,-1.2, 0.0,
    1.2, 1.6, 1.2,
    0.0,-1.2, 1.6
  );

  f = 0.5        * noise(pos); pos *= m;
  f += 0.25      * noise(pos); pos *= m;
  f += 0.125     * noise(pos); pos *= m;
  f += 0.0625    * noise(pos); pos *= m;
  f += 0.03125   * noise(pos); pos *= m;
  f += 0.015625  * noise(pos); pos *= m;
  f += 0.0078125 * noise(pos); pos *= m;

  return f;
}

vec2 normalizeScreenCoords(vec2 fragCoord, vec2 resolution) {
  vec2 result = 2.0 * (fragCoord / resolution - 0.5);
  result.x *= resolution.x / resolution.y;
  return result;
}

void main() {
  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy, iResolution);
  uv *= 16.0;
  vec3 pos = vec3(uv.x, uv.y, iTime/4.0);

  vec3 color;
  if (uv.x < 12.0*sin(iTime/1.5)) {
    color = vec3(noise(pos));
  } else {
    color = vec3(fbm(pos));
  }
  // gamma correction
  // color.xyz = pow(vec4(color, 1.0), vec4(1.0/2.2)).xyz;

  // gl_FragColor = vec4(color, 1.0);
  gl_FragColor = vec4(color, 1.0);
}
