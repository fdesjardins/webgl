uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;
uniform float iTime;

float sdCircle(vec2 pos, float rad){
  return length(pos) - rad;
}

float sdSquare(vec2 pos, vec2 r){
  vec2 d = abs(pos)-r;
  return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdRound(float d, float rad){
  return d-rad;
}

vec4 render(vec2 uv){
  // uv.x += 0.01*sin(uv.y*80.+iTime);
  float dCase = sdSquare(uv, vec2(0.1,0.2));
  dCase = sdRound(dCase, 0.02);
  float dCirc = sdCircle(uv+vec2(0.,.175), 0.0075);

  float d = dCase;
  if (dCirc < abs(d)) { d = dCirc; }

  if (abs(d) < 0.0025) {
    return vec4(d, vec3(0.0));
  }
  // show units of d
  // return vec4(d, vec3(1.0, 1.0, 0.0 + 1.*mod(d*100.,5.)));
  return vec4(d, vec3(0.7));
}

void main(){
  vec2 uv = (gl_FragCoord.xy - iResolution.xy*0.5)/iResolution.y; //-1-1
  uv.x -= iCameraPosition.x;
  uv.y += iCameraPosition.y;

  vec3 col = vec3(0.0);
  for (int x=0; x<=2; x+=1){
    for (int y=0; y<=2; y+=1){
      vec4 drgb = render(vec2(
        uv.x+float(x-1)*0.001,
        uv.y+float(y-1)*0.001));
      col += drgb.yzw;
    }
  }
  col /= 4.0;
  gl_FragColor = vec4(col, 1.0);
}
