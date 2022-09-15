varying vec2 vUv;

uniform vec2 iResolution;
uniform float iTime;

vec3 WHITE = vec3(1.0);
vec3 BLACK = vec3(0.0);
vec3 RED   = vec3(1.0, 0.0, 0.0);
vec3 GREEN = vec3(0.0, 1.0, 0.0);
vec3 BLUE  = vec3(0.0, 0.0, 1.0);

float POINT_RADIUS = 0.015;
float DRAW_POINTS = 0.0;

// resolution  ->  -0.5 .. 0.5
vec2 normalizeCoords() {
  return  gl_FragCoord.xy / iResolution - 0.5;
}

vec3 drawPoint(vec2 p, vec2 xy) {
  float d = distance(p, xy);
  if (d < POINT_RADIUS) {
    return WHITE;
  }
  return BLACK;
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

vec2 bezier(float t, vec2 p0, vec2 p1) {
  if (t < 0.0 || t > 1.0) {
    return vec2(2.0, 2.0);
  }
  return p0 + t * (p1 - p0);
}

vec2 qBezier(float t, vec2 p0, vec2 p1, vec2 p2) {
  float mt = 1.0 - t;
  return mt * (mt*p0 + t*p1) + t*(mt*p1 + t*p2);
}

vec2 cBezier(float t, vec2 p0, vec2 p1, vec2 p2, vec2 p3) {
  return (1.0 - t)*qBezier(t, p0, p1, p2) + t*qBezier(t, p1, p2, p3);
}
vec2 cBezier(float t, vec2 p0, vec2 p1, vec2 p2, vec2 p3, vec2 p4) {
  return (1.0 - t)*cBezier(t, p0, p1, p2, p3) + t*cBezier(t, p1, p2, p3, p4);
}
vec2 cBezier(float t, vec2 p0, vec2 p1, vec2 p2, vec2 p3, vec2 p4, vec2 p5) {
  return (1.0 - t)*cBezier(t, p0, p1, p2, p3, p4) + t*cBezier(t, p1, p2, p3, p4, p5);
}
vec2 cBezier(float t, vec2 p0, vec2 p1, vec2 p2, vec2 p3, vec2 p4, vec2 p5, vec2 p6) {
  return (1.0 - t)*cBezier(t, p0, p1, p2, p3, p4, p5) + t*cBezier(t, p1, p2, p3, p4, p5, p6);
}

void main() {
  vec2 p = normalizeCoords();
  vec3 color = BLACK;

  vec2 points[3];
  points[0] = vec2(0.0, 0.1);
  points[1] = vec2(-0.25, 0.0);
  points[2] = vec2(0.25, 0.0);

  float time = iTime / 2.0;
  p = rot2d(p, iTime/4.0);
  p = scale2d(p, vec2(0.5, 0.5) + sin(time)/6.0);
  float px = p.x + 0.5;

  {
  vec2 p0 = vec2(0.0, 0.5);
  vec2 p1 = vec2(1.0, 0.5);
  float sx = min(p0.x, p1.x);
  float ex = max(p0.x, p1.x);
  float l = ex - sx;
  float s = 1.0 / l;
  vec2 b2 = bezier((px - sx) * s, p0, p1);
  color += RED * drawPoint(p, b2-0.5);
  }

  {
  time *= 1.2;
  vec2 p0 = vec2(0.0, 0.5);
  vec2 p1 = vec2(0.5, 0.5 - sin(time));
  vec2 p2 = vec2(1.0, 0.5);
  color += DRAW_POINTS * GREEN * drawPoint(p, p0-0.5);
  color += DRAW_POINTS * GREEN * drawPoint(p, p1-0.5);
  color += DRAW_POINTS * GREEN * drawPoint(p, p2-0.5);

  float sx = min(min(p0.x, p1.x), p2.x);
  float ex = max(max(p0.x, p1.x), p2.x);
  float l = ex - sx;
  float s = 1.0 / l;
  vec2 b2 = qBezier((px - sx) * s, p0, p1, p2);
  color += GREEN * drawPoint(p, b2-0.5);
  }

  {
  time *= 1.2;
  vec2 p0 = vec2(0.0,   0.5);
  vec2 p1 = vec2(0.333, 0.5 - sin(time));
  vec2 p2 = vec2(0.666, 0.5 - cos(time));
  vec2 p3 = vec2(1.0,   0.5);
  color += DRAW_POINTS * BLUE * drawPoint(p, p0-0.5);
  color += DRAW_POINTS * BLUE * drawPoint(p, p1-0.5);
  color += DRAW_POINTS * BLUE * drawPoint(p, p2-0.5);
  color += DRAW_POINTS * BLUE * drawPoint(p, p3-0.5);

  float sx = min(min(min(p0.x, p1.x), p2.x), p3.x);
  float ex = max(max(max(p0.x, p1.x), p2.x), p3.x);
  float l = ex - sx;
  float s = 1.0 / l;
  vec2 b2 = cBezier((px - sx) * s, p0, p1, p2, p3);
  color += BLUE * drawPoint(p, b2-0.5);
  }

  {
  time *= 1.2;
  vec3 BG = BLUE + GREEN;
  vec2 p0 = vec2(0.0,  0.5);
  vec2 p1 = vec2(0.25, 0.5 - sin(time));
  vec2 p2 = vec2(0.5,  0.5 - cos(time));
  vec2 p3 = vec2(0.75, 0.5 - sin(time/3.0));
  vec2 p4 = vec2(1.0,  0.5);
  color += DRAW_POINTS * BG * drawPoint(p, p0-0.5);
  color += DRAW_POINTS * BG * drawPoint(p, p1-0.5);
  color += DRAW_POINTS * BG * drawPoint(p, p2-0.5);
  color += DRAW_POINTS * BG * drawPoint(p, p3-0.5);
  color += DRAW_POINTS * BG * drawPoint(p, p4-0.5);

  float sx = min(min(min(min(p0.x, p1.x), p2.x), p3.x), p4.x);
  float ex = max(max(max(max(p0.x, p1.x), p2.x), p3.x), p4.x);
  float l = ex - sx;
  float s = 1.0 / l;
  vec2 b2 = cBezier((px - sx) * s, p0, p1, p2, p3, p4);
  color += BG * drawPoint(p, b2-0.5);
  }

  {
  time *= 1.2;
  vec3 RG = RED + GREEN;
  vec2 p0 = vec2(0.0, 0.5);
  vec2 p1 = vec2(0.2, 0.5 - sin(time));
  vec2 p2 = vec2(0.4, 0.5 - cos(time));
  vec2 p3 = vec2(0.6, 0.5 - sin(time/3.0));
  vec2 p4 = vec2(0.8, 0.5 - cos(time/3.0));
  vec2 p5 = vec2(1.0, 0.5);
  color += DRAW_POINTS * RG * drawPoint(p, p0-0.5);
  color += DRAW_POINTS * RG * drawPoint(p, p1-0.5);
  color += DRAW_POINTS * RG * drawPoint(p, p2-0.5);
  color += DRAW_POINTS * RG * drawPoint(p, p3-0.5);
  color += DRAW_POINTS * RG * drawPoint(p, p4-0.5);
  color += DRAW_POINTS * RG * drawPoint(p, p5-0.5);

  float sx = min(min(min(min(min(p0.x, p1.x), p2.x), p3.x), p4.x), p5.x);
  float ex = max(max(max(max(max(p0.x, p1.x), p2.x), p3.x), p4.x), p5.x);
  float l = ex - sx;
  float s = 1.0 / l;
  vec2 b2 = cBezier((px - sx) * s, p0, p1, p2, p3, p4, p5);
  color += RG * drawPoint(p, b2-0.5);
  }

  {
  time *= 1.2;
  vec3 RB = RED + BLUE;
  float dx = 1.0 / 6.0;
  vec2 p0 = vec2(0.0,    0.5);
  vec2 p1 = vec2(dx,     0.5 - sin(time));
  vec2 p2 = vec2(dx*2.0, 0.5 - cos(time));
  vec2 p3 = vec2(dx*3.0, 0.5 - sin(time/3.0));
  vec2 p4 = vec2(dx*4.0, 0.5 - cos(time/3.0));
  vec2 p5 = vec2(dx*5.0, 0.5 - sin(time/4.0));
  vec2 p6 = vec2(1.0,    0.5);
  color += DRAW_POINTS * RB * drawPoint(p, p0-0.5);
  color += DRAW_POINTS * RB * drawPoint(p, p1-0.5);
  color += DRAW_POINTS * RB * drawPoint(p, p2-0.5);
  color += DRAW_POINTS * RB * drawPoint(p, p3-0.5);
  color += DRAW_POINTS * RB * drawPoint(p, p4-0.5);
  color += DRAW_POINTS * RB * drawPoint(p, p5-0.5);
  color += DRAW_POINTS * RB * drawPoint(p, p6-0.5);

  float sx = min(min(min(min(min(min(p0.x, p1.x), p2.x), p3.x), p4.x), p5.x), p6.x);
  float ex = max(max(max(max(max(max(p0.x, p1.x), p2.x), p3.x), p4.x), p5.x), p6.x);
  float l = ex - sx;
  float s = 1.0 / l;
  vec2 b2 = cBezier((px - sx) * s, p0, p1, p2, p3, p4, p5, p6);
  color += RB * drawPoint(p, b2-0.5);
  }

  gl_FragColor = vec4(color, 1.0);
}

