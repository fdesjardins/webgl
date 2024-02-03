uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;
uniform float iTime;

const int MAXSTEPS  = 120;
const float MAXDIST = 100.;
const float EPSILON = 1e-3;

// vec3 lpos(){ return vec3(sin(iTime/2.)*4., 2.0, cos(iTime/2.)*4.); }
vec3 lpos() { return vec3(-2.,2.,-1.); }

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

float sdBox(vec3 p, vec3 r) {
  vec3 d = abs(p) - r;
  return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

vec4 sdPump(vec3 p) {
  // outer shell
  float rad = 1.;
  rad -= 0.05*pow(0.5 + 0.5*sin(16.0*atan(p.x,p.z)), 3.0);
  float pump = length(p)-rad;
  {
    // eyes
    vec3 q = p;
    q.x = abs(q.x);
    vec3 eyeP = q-vec3(.3,.3,.8);
    float eye = length(eyeP)-0.2;
    pump = max(-eye,pump);
  }
  {
    // mouth
    vec3 mouthP = p-vec3(0.,-.2,.75);
    mouthP.y -= 0.075*cos(abs(p.x)*28.);
    mouthP.y += 0.125*cos(abs(p.x)*3.);
    float mouth = sdBox(mouthP, vec3(0.5,0.1,0.3));
    pump = max(-mouth,pump);
  }
  // inner shell
  float inside = length(p)-0.85;
  float ret = max(pump,-inside);
  // stem
  p.x += .07*-sin(p.y*9.+0.8);
  rad = .5 - 0.25*p.y;
  rad -= 0.01*pow(0.5 + 0.5*sin(16.0*atan(p.x,p.z)), 2.0);
  float stem = length(p.xz)-rad;
  stem = max(stem, p.y-1.3);
  stem = max(stem, .9-p.y);

  if (stem < pump) {
    return vec4(min(stem, pump), vec3(.1,.5,.1));
  }
  return vec4(ret, 1.,.3,.2);
}

vec4 map(vec3 p){
  vec4 pump = sdPump(p);
  float ground;
  float gnoise = noise(p*32.);
  {
    vec3 q = p;
    q.y -= gnoise*.02 + 2.*cos(p.x/8.) + 2.*cos(p.z/8.);
    ground = q.y + 4.85;
  }

  float moon = length(p-vec3(5.,8.,-45.))-1.0;
  // moon = max(-moon,length(p-vec3(1.1,1.9,0.))-.2);

  vec4 ret = pump;
  if (ground < pump.x) {
    ret = vec4(ground, noise(p*8.)*vec3(.25, .5,.15)+noise(p*4.)*vec3(.15,.1,0.));
  }
  if (moon < ret.x) {
    ret = vec4(moon, vec3(1.));
  }
  return ret;
}

vec4 render(vec3 ro, vec3 rd){
  float dp = 0.;
  for (int i=0; i<MAXSTEPS; i++){
    vec4 drgb = map(ro+rd*dp);
    if (drgb.x < EPSILON) {
      return vec4(dp,drgb.yzw);
    }
    dp+=drgb.x;
  }
  return vec4(MAXDIST,0.,0.,0.);
}

vec3 normal(vec3 pos) {
  float d = map(pos).x;
  vec2 offset = vec2(0.001, 0.0);
  return normalize(vec3(
    map(pos + offset.xyy).x,
    map(pos + offset.yxy).x,
    map(pos + offset.yyx).x
  ) - d);
}

vec3 lambert(vec3 col, vec3 p, vec3 eye, vec3 lp){
  vec3 amb = vec3(.1);
  vec3 dif = amb * col;
  vec3 lint = vec3(.3,.4,.8)*2.;
  vec3 n = normal(p);
  vec3 l = normalize(lp - p);
  float dotln = dot(l,n);
  if (dotln < 0.) return dif;
  dif += dotln * col * lint;
  return dif;
}

vec3 getRayDirection(vec2 uv, vec3 origin, vec3 target, float fov) {
  vec3 forward = normalize(target - origin);
  vec3 right = -1.0 * normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = -1.0 * normalize(cross(forward, right));
  return normalize(uv.x * right + uv.y * up + forward * fov);
}

float calcShadow(vec3 pos) {
  float res = 1.0;
  vec3 dir = normalize(lpos() - pos);
  for (float t = 0.1; t <= 50.; ) {
    float h = map(pos + dir * t).x;
    if (h < 0.001) {
      return 0.0;
    }
    res = min(res, 8.0 * h / t);
    t += h;
  }
  return res;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - iResolution.xy*0.5)/iResolution.y; //-1-1
  vec3 ro = iCameraPosition;
  vec3 cd = iCameraDirection;
  vec3 target = ro + cd;
  vec3 rd = getRayDirection(uv, ro, target, 3.0);

  vec4 drgb = render(ro,rd);
  float d = drgb.x;
  vec3 rgb = drgb.yzw;

  if (d == MAXDIST){
    gl_FragColor = vec4(0.,0.,0.,1.);
    float r = pow(noise(rd*1280.), 64.);
    // if (rd.y > 0. && rand(rd) > .9995) {
    if (rd.y > 0. && r > .1) {
      gl_FragColor = 0.8*vec4(rand(rd*2.),rand(rd*4.),rand(rd*6.),1.)*sin(rd.x*256.+iTime);
    }
    if (rd.y > 0.) {
      gl_FragColor += .2*vec4(noise(rd*16.)*.2, .3,.3,0.1)*noise(rd*(16.));
    }
    return;
  }

  vec3 pos = ro+rd*d;
  rgb *= lambert(rgb, pos, ro, lpos());

  float inShadow = calcShadow(pos);
  if (inShadow != 1.0) {
    rgb *= clamp(inShadow, 0.5, 1.0);
  }
  // light up the inside
  if (length(abs(pos))<0.85) {
    rgb = vec3(1.,.7,.1) * (sin(iTime)*.1+.7) + (clamp(tan(iTime+sin(iTime)*12.), 0.12, .16));
  }

  // moon
  if (pos.y > 5. && d > 20.) {
    rgb = mix(vec3(1.,1.,.9), vec3(noise(pos*7.)), 0.25);
    rgb = mix(rgb, vec3(noise(pos*4.)), 0.3);
    rgb = mix(rgb, vec3(noise(pos*2.)), 0.2);
  }
  // fog
  rgb = mix(rgb, vec3(0.015), smoothstep(0.0, 700./2.0, d));


  gl_FragColor = vec4(rgb,1.);
}
