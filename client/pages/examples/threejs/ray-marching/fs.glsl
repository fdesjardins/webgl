uniform float iTime;
uniform vec3 cameraPos;
varying vec2 texCoord;
varying vec2 vUv;

const int MAX_MARCHING_STEPS = 250;
const float MIN_DIST = 0.0;
const float MAX_DIST = 1000.0;
const float EPSILON = 0.001;

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float sdBox(vec3 p, vec3 b){
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdRoundBox(vec3 p, vec3 b, float r){
  return sdBox(p, b) - r;
}

float sdTorus(vec3 p, vec2 t){
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdIntersect(float a, float b){
  return max(a, b);
}

float sdUnion(float a, float b){
  return min(a, b);
}

float sdDiff(float a, float b){
  return max(a, -b);
}

mat4 rotateY(float theta){
  float c = cos(theta);
  float s = sin(theta);
  return mat4(
    vec4(c, 0, s, 0),
    vec4(0, 1, 0, 0),
    vec4(-s, 0, c, 0),
    vec4(0, 0, 0, 1)
  );
}

mat4 translateY(float dist){
  return mat4(
    vec4(1, 0, 0, 0),
    vec4(0, 1, 0, dist),
    vec4(0, 0, 1, 0),
    vec4(0, 0, 0, 1)
  );
}

float sdScene(vec3 p) {
  float cubeTheta = sin(iTime);
  vec3 cubePoint = (vec4(p, 1.0) * rotateY(cubeTheta)).xyz;
  vec3 cubeSize = vec3(0.25, 0.25, 0.25);

  vec3 floorPoint = (vec4(p, 1.0) * translateY(0.5)).xyz;
  float sceneFloor = sdBox(floorPoint, vec3(5.0, 0.1, 5.0));

  return sdUnion(
    sceneFloor,
    sdDiff(
      sdUnion(
        sdSphere(vec4(p, 1.0).xyz, 0.5),
        sdRoundBox(cubePoint, cubeSize, 0.35)
      ),
      sdTorus(p, vec2(1.0, 0.25))
    )
  );
}

float render(vec3 eye, vec3 dir, float start, float end) {
  float depth = start;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    float dist = sdScene(eye + depth * dir);
    if (dist < EPSILON) {
	    return depth;
    }
    depth += dist;
    if (depth >= end) {
      return end;
    }
  }
  return end;
}

vec3 rayDirection(float fov, vec2 size, vec2 fragCoord) {
  vec2 xy = fragCoord - size / 2.0;
  float z = size.y / tan(radians(fov) / 2.0);
  return normalize(vec3(xy, -z));
}

vec3 estimateNormal(vec3 p) {
  return normalize(vec3(
    sdScene(vec3(p.x + EPSILON, p.y, p.z)) - sdScene(vec3(p.x - EPSILON, p.y, p.z)),
    sdScene(vec3(p.x, p.y + EPSILON, p.z)) - sdScene(vec3(p.x, p.y - EPSILON, p.z)),
    sdScene(vec3(p.x, p.y, p.z  + EPSILON)) - sdScene(vec3(p.x, p.y, p.z - EPSILON))
  ));
}

vec3 calcPhong(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye, vec3 lightPos, vec3 lightIntensity) {
  vec3 N = estimateNormal(p);
  vec3 L = normalize(lightPos - p);
  vec3 V = normalize(eye - p);
  vec3 R = normalize(reflect(-L, N));

  float dotLN = dot(L, N);
  float dotRV = dot(R, V);

  // Light not visible from this point on the surface
  if (dotLN < 0.0) {
    return vec3(0.0, 0.0, 0.0);
  }

  // Light reflection in opposite direction as viewer, apply only diffuse
  if (dotRV < 0.0) {
    return lightIntensity * (k_d * dotLN);
  }
  return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
}

vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
    const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
    vec3 color = ambientLight * k_a;

    vec3 lightPosition = vec3(4.0 * sin(iTime), 2.0, 4.0 * cos(iTime));
    vec3 lightIntensity = vec3(0.5, 0.5, 0.5);

    color += calcPhong(k_d, k_s, alpha, p, eye, lightPosition, lightIntensity);

    return color;
}

vec3 lambertIllumination(vec3 color, vec3 p, vec3 eye) {
  const vec3 ambientLight = 0.35 * vec3(1.0, 1.0, 1.0);
  vec3 diffuse = ambientLight * color;

  vec3 lightPosition = vec3(4.0 * sin(iTime), 2.0, 4.0 * cos(iTime));
  vec3 lightIntensity = vec3(0.5, 0.5, 0.5);

  vec3 N = estimateNormal(p);
  vec3 L = normalize(lightPosition - p);

  float dotLN = dot(L, N);
  // Light not visible from this point on the surface
  if (dotLN < 0.0) {
    return diffuse;
  }

  diffuse += dotLN * color * lightIntensity;

  return diffuse;
}
//
// vec3 cookTorranceSpec(vec3 color)

mat4 viewMatrix2(vec3 eye, vec3 center, vec3 up){
  vec3 f = normalize(center - eye);
  vec3 s = normalize(cross(f, up));
  vec3 u = cross(s, f);
  return mat4(
    vec4(s, 0.0),
    vec4(u, 0.0),
    vec4(-f, 0.0),
    vec4(0.0, 0.0, 0.0, 1.0)
  );
}

const int AA = 2;
const vec2 SIZE = vec2(723, 723);
const float FOV = 45.0;

float apprSoftShadow(vec3 ro, vec3 rd, float mint, float tmax, float w){
  return 1.0;
}

void main(){
  // vec3 dir = rayDirection(45.0, SIZE, gl_FragCoord.xy);
  mat4 viewToWorld = viewMatrix2(cameraPos, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));

  vec3 final = vec3(0.0);
  for (int m = 0; m < AA; m++){
    for (int n = 0; n < AA; n++){

      // if (gl_FragCoord.x < 361.0) {
      //   final += vec3(1.0, 0.0, 0.0);
      //   continue;
      // }

      vec2 offset = vec2(float(m), float(n)) / float(AA) - 0.5;
      vec2 p = 2.0 * (gl_FragCoord.xy + offset) - SIZE / 2.0;
      vec3 dir = rayDirection(FOV, SIZE, p);
      vec3 worldDir = (viewToWorld * vec4(dir, 0.0)).xyz;
      float dist = render(cameraPos, worldDir, MIN_DIST, MAX_DIST);

      if (dist > MAX_DIST - EPSILON) {
    	  continue;
      }

      // lighting
      vec3 p2 = cameraPos + dist * worldDir;
      vec3 K_a = vec3(0.35, 0.35, 0.35);
      vec3 K_d = vec3(0.6, 0.6, 0.6);
      vec3 K_s = vec3(1.0, 1.0, 1.0);
      float shininess = 10.0;
      final += phongIllumination(K_a, K_d, K_s, shininess, p2, cameraPos);

      vec3 light = normalize(vec3(-0.1, 0.3, 0.6));
      float shadow = apprSoftShadow(p2, light, 0.01, 3.0, 5.0);

      final *= shadow;
      // vec3 I_L =
      // vec3 N =
      // vec3 color = vec3(0.6, 0.6, 0.6);
      // final += lambertIllumination(color, p2, cameraPos);
    }
  }
  final /= float(AA * AA);

  gl_FragColor = vec4(final, 1.0);
}
