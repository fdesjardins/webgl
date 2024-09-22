uniform vec2 iResolution;
uniform float iTime;
uniform vec3 iCameraPosition;

const vec3 WHITE = vec3(1.0);
const vec3 RED = vec3(0.5,0.0,0.0);
const vec3 BLACK = vec3(0.0);

vec3 LIGHTPOS = vec3(0.,0.,1.);

vec4 grid(vec2 p, vec4 color) {
  // vec4 color = vec4(BLACK, 1.0);

  vec2 lineWidth = max(2./iResolution.xy, .0002 / abs(iCameraPosition.z) / 0.3);
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

  return vec4(color.rgb, 1.0);
}

float map(vec3 p) {
  // return (sin(p.y) + cos(p.x));
  // return sin(p.y)/2.+0.5;
  // if (p.x < 0.0) {
  float val = sin(p.y)*.2 - abs(sin(p.x));
  // val = val/2. + 0.25*sin(iTime);
  val = val/2.+0.7;

  return smoothstep(0., 1., val);
  // }
  // return -20.0;
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

vec3 lightPos(float time){
  // return vec3(sin(time), cos(time), 2. + sin(time)) * 10.;
  return vec3(sin(time)*20.,0.,0.1);
}

vec3 lambert(vec3 color, vec3 p, vec3 eye) {
  const vec3 ambientLight = 0.2 * vec3(1.0, 1.0, 1.0);
  vec3 diffuse = ambientLight * color;

  vec3 lightIntensity = vec3(0.85, 0.85, 0.85);

  vec3 N = normal(p);
  vec3 L = normalize(lightPos(iTime) - p);

  float dotLN = dot(L, N);
  // Light not visible from this point on the surface
  if (dotLN < 0.0) {
    return diffuse;
  }
  diffuse += dotLN * color * lightIntensity;
  return diffuse;
}

void main() {

  vec3 camPos = iCameraPosition;
  camPos.z = abs(camPos.z);
  float time = iTime;

  // scale initial grid to -1..1
  vec2 p = (gl_FragCoord.xy / iResolution - 0.5) * 2.0;

  p.x -= camPos.x / 1.4 / abs(camPos.z);
  p.y += camPos.y / abs(camPos.z);

  vec4 color = vec4(RED, 1.);
  // color = grid(p, color);

  vec3 ro = camPos;
  vec3 target = normalize(vec3(0.,0.,0.));
  vec3 up = vec3(0.,1.,0.);
  vec3 right = normalize(cross(target,up));
  vec3 rd = normalize((right*p.x + up*p.y)-target);

  // color.rgb += BLACK * length(target-ro) * 8.0;


  vec3 p3 = vec3(p,camPos)*30.;
  // p3.xy += p3.z;
  // p3.y += 0.1*time;
  // p3.x += 0.1*time;

  // if (sin(p3.y*20.) < 0.0) {
    // vec3 lpos = LIGHTPOS;
    // lpos.y += sin(time);
    // p.y += time;
    // color.rgb = RED - dot(lpos, 0.2*normal(vec3(p3)));
    if (map(p3) < .5) {
      color.rgb *= smoothstep(0.1, 1., 1.5-lambert(WHITE, p3, ro));
    } else {
      // color.b = 0.5;
      // color.r = 0.;
    }
  // color.rgb *= map(p3)/2.*lambert(WHITE,p3,p3);
  // }

  gl_FragColor = color;
}
