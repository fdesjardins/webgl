uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;
uniform float iTime;

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

float sphereSD(vec3 pos, float rad) {
  return length(pos) - rad;
}

float sdVStick(vec3 p, float h) {
  float d = max(p.y - h, 0.0);
  return sqrt(p.x*p.x + p.z*p.z + d*d);
}

vec4 eyeSD(vec3 p, float rad) {

  vec3 bp = p;

  // float an2 = sin(iTime)*.35;
  float xrot = iCameraDirection.x*.01;
  float yrot = iCameraDirection.y*.01;

  vec3 eyep = bp + vec3(0.,-0.02,.06);
  vec4 eye = vec4(sphereSD(eyep,0.06*rad), 1.,1.,1.);

  vec3 eyerotp = eyep;
  eyerotp.xz *= mat2(cos(xrot), -sin(xrot),
                    sin(xrot),  cos(xrot));
  eyerotp.yz *= mat2(cos(yrot), -sin(yrot),
                     sin(yrot),  cos(yrot));

  vec3 irisp = eyerotp + iCameraDirection*.0025*rad;// + vec3(0.,-0.02,.06);
  vec4 iris = vec4(sphereSD(irisp,0.05*rad), vec3(.9,.7,0.)/(abs(sin(irisp.x*10.)) + abs(cos(irisp.x*10.))));

  vec3 pupilp = eyerotp + iCameraDirection*.0105*rad;
  pupilp.x *= 2.0;
  vec4 pupil = vec4(sphereSD(pupilp,0.03*rad), 0.,.0,0.);

  vec4 result = eye;
  // if (eye.x < result.x) { result = eye; }
  if (iris.x < result.x) { result = iris; }
  if (pupil.x < result.x) { result = pupil; }
  result.x = eye.x;
  return result;
}

vec4 map(vec3 p){

  vec3 bp = p;
  bp.y += sin(iTime*2.)*.005;
  float n = pow(noise(vec3(bp)*74.), 3.+sin(iTime)*1.5);

  vec4 body = vec4(sphereSD(bp, 0.1), vec3(.6, .5, .5)-(n*.3));
  body.x -= pow(n*.01, 0.995);

  vec3 armp = bp + vec3(0.,.0,0.);
  armp.y *= -3.;
  armp.x += sin(armp.y*10.+iTime)/50.;
  armp.xy -= n*.01;
  vec4 arm = vec4(sdVStick(armp, 0.01)-0.02, 1.,1.,1.);
  body.x = min(arm.x, body.x);

  vec4 eye = eyeSD(bp, 1.0);
  vec4 eye2 = eyeSD(bp+vec3(.1,0.,0.), 0.25);
  vec4 eye3 = eyeSD(bp+vec3(.05,-.1,0.), 0.25);
  vec4 eye4 = eyeSD(bp+vec3(-.05,-.1,0.), 0.25);

  vec4 result = body;
  if (eye.x < result.x) { result = eye; }
  if (eye2.x < result.x) { result = eye2; }
  if (eye3.x < result.x) { result = eye3; }
  if (eye4.x < result.x) { result = eye4; }
  // if (iris.x < result.x) { result = iris; }
  // if (pupil.x < result.x) { result = pupil; }
  // if (arm.x < result.x) { result = arm; }

  return result;
}

vec4 render(vec3 ro, vec3 rd){
  // Test intersection with sphere first
  vec3 L = vec3(0.0) - ro;
  float t_ca = dot(rd, L);
  vec4 tuvw = vec4(0.0);
  float d = sqrt(dot(L, L) - dot(t_ca,t_ca));
  if (d > 0.3) {
    return vec4(0.);
  }

  float dp = 0.;
  for (int i=0; i<70; i+=1){
    vec4 drgb = map(ro+rd*(dp-1e-4));
    if (drgb.x < 1e-5) {
      return vec4(dp, drgb.yzw);
    }
    dp+=drgb.x;
  }
  return vec4(0.);
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

vec3 lpos(){
  return vec3(1.,1.,-1.);
}

vec3 lambert(vec3 col, vec3 p, vec3 eye, vec3 lp){
  vec3 amb = vec3(.3);
  vec3 dif = amb * col;
  vec3 lint = vec3(.8,.8,.8)*2.;
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

void main(){
  vec2 uv = (gl_FragCoord.xy - iResolution.xy*0.5)/iResolution.y; //-1-1
  vec3 ro = iCameraPosition;
  vec3 cd = iCameraDirection;
  vec3 target = ro + cd;
  vec3 rd = getRayDirection(uv, ro, target, 3.0);

  // float time = iTime/1.5;
  // ro.z += time*4.0;
  // rd.x += sin(time)*.02;
  // rd.y += cos(time)*.05;
  vec4 drgb = render(ro,rd);
  float d = drgb.x;
  vec3 rgb = drgb.yzw;

  vec3 pos = ro+rd*d;
  rgb *= lambert(rgb, pos, ro, lpos());

  if (drgb.x == 0.){
    gl_FragColor = vec4(0.,0.,0.,1.);
    return;
  }

  // float d2 = d/50.;
  // vec4 col = vec4(.5-d2, .5-d2+.2*cos(time/2.), .5-d2+.2*sin(time/2.), 1.);
  // vec3 lpos = vec3(-rd.x,-rd.y,0.);
  // col.xyz *= dot(lpos,normal(ro+rd*d))*4.;
  gl_FragColor = vec4(rgb, 1.0);
}
