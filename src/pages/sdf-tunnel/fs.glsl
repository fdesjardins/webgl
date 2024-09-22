uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform float iTime;

float map(vec3 p){
  // sdf for a sphere
  return length(p)-0.1;
}

// march from the ro=ray origin in the rd=ray direction until distance
// is less than some really small number ("epsilon", 2e-3 below)
vec4 render(vec3 ro, vec3 rd){
  // dp is where we accumulate distance during each step
  float dp = 0.;
  // march up to 200 steps
  for (int i=0; i<200; i+=1){
    // get the distance to the nearest object in the scene
    float d = map(ro+rd*dp);
    // if d less than our epsilon, return dp (total distance)
    if (d < 2e-3) {
      return vec4(dp);
    }
    dp+=d;
  }
  // if the ray never hits anything, return 0 for distance
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
  vec2 uv2 = (gl_FragCoord.xy - iResolution.xy*0.5)/iResolution.y; //-1-1

  // ray origin
  vec3 ro = iCameraPosition;
  vec3 target = normalize(vec3(0.,0.,-1.));
  // up vector
  vec3 up = vec3(0.,1.,0.);
  // right vector
  vec3 right = normalize(cross(target,up));
  // ray direction
  vec3 rd = normalize((right*uv2.x + up*uv2.y)-target);

  // d = distance
  float d = render(ro,rd).x;

  // if d = 0 (we never hit anything) return black
  if (d == 0.){
    gl_FragColor = vec4(0.,0.,0.,1.);
    return;
  }

  vec4 col = vec4(1.0);
  // light position
  vec3 lpos = vec3(0.0, 1.0, -1.);
  // adjust color based on light pos and estimated normal
  col.xyz *= dot(lpos,normal(ro+rd*d))*4.;

  gl_FragColor = col;
}
