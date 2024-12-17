precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;

const vec3 WHITE = vec3(1.0);
const vec3 RED = vec3(1.0,0.0,0.0);
const vec3 BLUE = vec3(0.0,0.0,1.0);
const vec3 GREEN = vec3(0.0,1.0,0.0);
const vec3 YELLOW = RED+GREEN;
const vec3 BLACK = vec3(0.0);

// vec3 LIGHTPOS = vec3(0.,0.35,0.);
vec3 lightPos() {
  // return vec3(sin(iTime/2.)/1.5,0.5,0.);
  // return vec3(sin(iTime/2.)/1.5,0.5,0.);
  return vec3(0.,0.75,0.);
}

vec4 grid(vec2 p, vec4 color) {
  // vec4 color = vec4(BLACK, 1.0);

  vec2 lineWidth = max(2./iResolution.xy, .001 / abs(iCameraPosition.z) / 0.3);
  float lineSpacing = .25 / abs(iCameraPosition.z);
  float majorLineSpacing = .5 / abs(iCameraPosition.z);

  // xy-grid
  if (mod(p.x, lineSpacing) < lineWidth.x) {
    color.rgb = WHITE * smoothstep(0., 1., lineSpacing/mod(p.x, lineSpacing));
  }
  if (mod(p.y, lineSpacing) < lineWidth.y) {
    color.rgb = WHITE * smoothstep(0., 1., lineSpacing/mod(p.y, lineSpacing));
  }
  if (mod(p.x, majorLineSpacing) < lineWidth.x) {
    color.rgb = RED * smoothstep(0., 1., lineSpacing/mod(p.y, lineSpacing));
  }

  return vec4(color.rgb, 0.2);
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

vec3 wave(vec3 p) {
  vec3 result = vec3(p);
  p.zy *= 20.;
  p.x *= 2400.;

  float t = iTime * 4.0;
  vec2 A = vec2(0.06);

  // Jones vectors
  // Circular polarization
  vec3 w = vec3(
    A.x * cos(p.x+t),
    A.y* -sin(p.x+t),
    0.0
  );

  // Diagonal
  // vec3 w = vec3(
  //   A.x*sin(sqrt(1./2.)*(p.x)+iTime),
  //   A.y*sin(sqrt(1./2.)*(p.x)+iTime),
  //   0.0
  // );

  result.y += w.y;
  result.z += w.x;
  return result;
}

vec4 map(vec3 p, out float d){
  p.y -= 0.15;
  float rad = 0.01;
  vec4 v = vec4(YELLOW,0.);
  {
    vec3 p2 = p;
    // p2.z *= 2.0;
    // p2.y += sin(p2.x*20. + iTime)*.1;
    // p2.y -= sin(p2.x*10. + iTime)*.05;
    // p2.
    // p2.xy *= 2.;
    // p2.z /= 2.;
    // p2.xy /= rad*2.0;
    p2.x /= rad*1.0e4;
    p2 = wave(p2);
    v.w = length(p2)-rad;
    v.r -= p2.x*100.;
  }
  vec4 h = vec4(BLUE,0.);

  vec4 light = vec4(YELLOW,0.);
  {
    vec3 p2 = p;
    p2 -= lightPos();
    light.w = length(p2)-0.0001;
  }
  // {
  //   vec3 p2 = p;
  //   p2.y *= 2.0;
  //   p2.z += cos(p2.x*20. + iTime)*.1;
  //   p2.z -= cos(p2.x*10. + iTime)*.05;
  //   p2.x /= rad*1.0e4;
  //   h.w = length(p2)-rad;
  // }
  vec4 hFill = vec4(vec3(1.),0.);
  {
    vec3 p2 = p;
    p2.y += 0.15;
    hFill.w = sdBox(p2, vec3(1.,.001,.25));
    if (mod(p2.x, 0.1) < 0.003) {
      hFill.rgb = vec3(BLACK);
    }
    if (mod(p2.z, 0.1) < 0.003) {
      hFill.rgb = vec3(BLACK);
    }
  }

  // if (light.w < hFill.w && light.w < v.w) {
  //   d = light.w;
  //   return vec4(light.rgb,1.);
  // }

  if (hFill.w <= v.w) {
    d = hFill.w;
    return vec4(hFill.rgb, 0.5);
    // return hFill * 0.5;
  }
  // if (v.w <= h.w) {
    d = v.w;
    return vec4(v.rgb, 1.0);
  // }

  // d = h.w;
  // return vec4(h.rgb, 1.0);
}

vec4 render(vec3 ro, vec3 rd, out float d){
  float dp = 0.;
  float _d = 0.;
  for (int i=0; i<300; i+=1){
    vec4 hit = map(ro+rd*dp, _d);
    // float d2 = _d;
    // if (d2 < 0.0) {
    //   d = d2;
    //   return hit;
    // }
    if (_d < 1e-4) {
      d = dp;
      return hit;
    }
    dp+=_d/3.3;
    if (dp > 9.0) {
      return vec4(0.);
    }
  }
  return vec4(0.);
}

vec3 normal(vec3 pos) {
  float d, d2, d3, d4;
  vec2 offset = vec2(0.001, 0.0);
  map(pos, d);
  map(pos + offset.xyy, d2);
  map(pos + offset.yxy, d3);
  map(pos + offset.yyx, d4);
  return normalize(vec3(
    d2,
    d3,
    d4
  ) - d);
}



vec3 lambert(vec3 col, vec3 p, vec3 eye){
  vec3 amb = vec3(0.1);
  vec3 dif = amb * col;
  // vec3 lint = vec3(.3,.4,.8)*2.;
  vec3 lint = WHITE*.75;
  vec3 n = normal(p);
  vec3 l = normalize(lightPos()-p);
  float dotln = dot(l,n);
  if (dotln < 0.){ return dif; }
  dif += dotln * col * lint;
  return dif;
}

float calcShadow(vec3 pos) {
  float res = 1.0;
  vec3 dir = normalize(lightPos() - pos);
  float h = 0.;
  for (float t = 0.1; t <= 2.; ) {
    map(pos + dir * t, h);
    if (h < 0.001) {
      return 0.0;
    }
    res = min(res, 8.0 * h / t);
    t += h/2.0;
  }
  return res;
}

void main() {

  vec3 camPos = iCameraPosition;
  vec3 cameraDir = iCameraDirection;
  vec3 cameraTarget = camPos + vec3(cameraDir.x, cameraDir.y, cameraDir.z);
  float fov = 95.;
  vec2 p = (gl_FragCoord.xy - iResolution.xy*0.5)/iResolution.y;

  vec4 color = vec4(BLACK, 0.);

  vec3 ro = camPos;
  vec3 target = cameraTarget;
  vec3 forward = normalize(target - ro);
  vec3 right = -1.0 * normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = -1.0 * normalize(cross(forward, right));
  vec3 rd = normalize(p.x * right + p.y * up + forward * 180.0/fov);

  vec4 final = vec4(0.);
  for (int x=0; x<=1; x++) {
  for (int y=0; y<=1; y++) {
    vec3 rd = normalize(p.x * right + p.y * up + forward * 180.0/fov);
    rd.x += 0.0002*(float(x)-0.5)*iResolution.x/1000.;
    rd.y += 0.0002*(float(y)-0.5)*iResolution.y/1000.;

    float d = 0.;
    vec4 result = render(ro, rd, d);

    if (d == 0.0) {
      // color = grid(p, vec4(BLACK,0.1));
      color = vec4(BLACK,0.5);
      if (color.r > 0.0) {
        color *= 0.0;
      }
      gl_FragColor = color;
      return;
    }

    color = result;
    // if (color.a > 1.) {
    //   // color = vec4(0.);
    //   // color.a = 0.01;
    //   float d2 = d;
    //   vec3 ro2 = ro+rd*(d2+1.);
    //   vec4 col2 = render(ro2, rd, d2);
    //   if (d2 != 0.) {
    //     color += col2;
    //   }
    //   if (d2 == 0.0) {
    //     color.r = ro2.z;
    //   }
    // }
    vec3 pos = ro+rd*d;
    color.rgb *= 1.0*lambert(color.rgb, pos, ro);

    float inShadow = calcShadow(pos);
    // if (inShadow == 0.0){
    color.rgb *= smoothstep(0.0,1.,inShadow+0.1);
    // }
    // color.rgb *= 1.0/inShadow;
      // color.rgb = mix(color.rgb, calcShadow(pos), 0.5);
    // if (inShadow == 0.0) {
    // }
    // color.rgb += normal(ro+rd*d).y;
    // final += color/2.0;

    // final = color;
    final += color/4.;
  }
  }
  // gamma correction
  final.rgb = pow(vec4(final.rgb, 1.0), vec4(1.0/2.2)).rgb;
  gl_FragColor = final;
}
