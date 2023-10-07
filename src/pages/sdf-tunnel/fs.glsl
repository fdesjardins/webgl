uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform float iTime;

float map(vec3 p){
  p.x += sin(iTime/3.+p.z/4.)*.9;
  p.y += cos(iTime/3.+p.z/4.)*.5;
  p.xy -= vec2(sin(p.z*9.),cos(p.z*9.))*.15;
  p.x += .15*sin(p.y*4.-p.z);
  p.y += .15*cos(p.x*3.+p.z);
  return 1.-length(p.xy)*.3;
}

vec4 render(vec3 ro, vec3 rd){
  float dp = 0.;
  for (int i=0; i<200; i+=1){
    float d = map(ro+rd*dp);
    if (d < 2e-3) {
      return vec4(dp);
    }
    dp+=d;
  }
  return vec4(0.);
}

vec3 normal(vec3 pos) {
  float d = map(pos);
  vec2 offset = vec2(0.001, 0.0);
  return normalize(vec3(
    map(pos + offset.xyy),
    map(pos + offset.yxy),
    map(pos + offset.yyx)
  ) - d);
}

void main(){
  // vec2 uv = gl_FragCoord.xy/iResolution.xy; //0-1
  vec2 uv2 = (gl_FragCoord.xy - iResolution.xy*0.5)/iResolution.y; //-1-1
  // vec3 ro = vec3(0.);
  vec3 ro = iCameraPosition;
  vec3 target = normalize(vec3(0.,0.,-1.));
  vec3 up = vec3(0.,1.,0.);
  vec3 right = normalize(cross(target,up));
  vec3 rd = normalize((right*uv2.x + up*uv2.y)-target);

  float time = iTime/1.5;
  ro.z += time*4.0;
  rd.x += sin(time)*.02;
  rd.y += cos(time)*.05;
  float d = render(ro,rd).x;

  if (d == 0.){
    gl_FragColor = vec4(0.,0.,0.,1.);
    return;
  }

  float d2 = d/50.;
  vec4 col = vec4(.5-d2, .5-d2+.2*cos(time/2.), .5-d2+.2*sin(time/2.), 1.);
  vec3 lpos = vec3(-rd.x,-rd.y,0.);
  col.xyz *= dot(lpos,normal(ro+rd*d))*4.;
  gl_FragColor = col;
}
