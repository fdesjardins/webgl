varying vec2 vUv;

uniform vec2 iResolution;
uniform float iTime;

vec3 WHITE = vec3(1.0);
vec3 BLACK = vec3(0.0);

// resolution  ->  -0.5 .. 0.5
vec2 normalizeCoords() {
  return  gl_FragCoord.xy / iResolution - 0.5;
}

vec3 drawVec(vec2 p, vec2 xy) {
  float d = distance(p, vec2(0.0));
  if (d < 0.005) {
    return WHITE;
  }
  float d2 = distance(p, xy);
  if (d2 < 0.005) {
    return WHITE;
  }
  return BLACK;
}

void drawLine(vec2 p, float a, float b) {
  float y = p.x * a + b;
  float d = distance(p, vec2(p.x, y));
  if (d < 0.0025) {
    gl_FragColor = vec4(1.0);
  }
}

vec3 drawLineSegment(vec2 p, float a, float b, float r) {
  float y = p.x * a + b;
  float d = distance(p, vec2(p.x, y));
  float d_origin = distance(p, vec2(0.0));
  if (d < 0.0025 && d_origin < r) {
    return WHITE;
  }
  return BLACK;
}

vec2 rot2d(vec2 p, float theta) {
  return p * mat2x2(
    cos(theta), -sin(theta),
    sin(theta),  cos(theta)
  );
}

float deg2rad(float d) {
  return d / 180.0 * 3.1415;
}

vec2 scale2d(vec2 p, vec2 k) {
  return p * mat2x2(
    1.0/k.x, 0.0,
    0.0,     1.0
  ) * mat2x2(
    1.0, 0.0,
    0.0,   1.0/k.y
  );
}

vec3 drawVec2(vec2 p) {
  vec3 color = BLACK;
  color += drawLineSegment(vec2(p.x - 0.125, p.y), 0.0, 0.0, 0.125);
  color += drawLineSegment(
    rot2d(vec2(p.x - .25, -abs(p.y)), deg2rad(135.0)) - vec2(0.03525,0.0),
     0.0,
     0.0,
     0.03525
  );
  color += drawVec(p, vec2(0.25, 0.0));
  return color;
}

void main() {
  vec2 p = normalizeCoords();

  vec3 color = BLACK;
  float time = iTime / 2.0;
  // time = 0.0;

  vec2 p2 = rot2d(p, time);
  color += drawVec2(scale2d(p2, vec2(1.0, 0.5)));
  // color += drawVec2(scale2d(rot2d(p + vec2(0.25, 0.0), -time), vec2(1.0, 0.5)));
  color *= vec3(1.0, 0.0, 0.0);

  color += drawLineSegment(
    vec2(p2.x - 0.1, sin((time/8.0 + p2.x) * 96.0) * 0.025 + p2.y),
    0.0,
    0.0,
    0.085
  );

  // color *= ;

  gl_FragColor = vec4(color, 1.0);
}
