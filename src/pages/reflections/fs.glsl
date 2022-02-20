uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;
uniform float iCameraFov;

varying vec2 texCoord;
varying vec2 vUv;

const int MAX_MARCHING_STEPS = 250;
const float MIN_DIST = 0.0;
const float MAX_DIST = 1000.0;
const float EPSILON = 0.0005;

const vec3 RED = vec3(1.0, 0.0, 0.0);
const vec3 GREEN = vec3(0.0, 1.0, 0.0);
const vec3 BLUE = vec3(0.0, 0.0, 1.0);
const vec3 ORANGE = vec3(0.8, 0.5, 0.0);

float sphereSD(vec3 pos, float rad) {
  return length(pos) - rad;
}

float boxSD(vec3 pos, vec3 r) {
  return length(max(abs(pos) - r, 0.0));
}

float flatPlaneSD(vec3 pos, float y) {
  return pos.y - y;
}

vec4 rotatingBox(vec3 pos) {
  float time = iTime / 2.0;

  vec3 movingPos = vec3(
    pos.x + 3.0 * sin(time),
    pos.y + 3.0 * cos(time),
    pos.z + 3.0 * sin(time * 1.5)
  );
  // Rotation
  float angle = time;
  movingPos.yz *= mat2(
    cos(angle), -sin(angle),
    sin(angle),  cos(angle)
  );
  movingPos.xy *= mat2(
    cos(angle), -sin(angle),
    sin(angle),  cos(angle)
  );

  vec4 box = vec4(boxSD(movingPos, vec3(0.35)), vec3(0.0));
  vec4 sphere = vec4(sphereSD(movingPos, 0.45), GREEN);
  if (box.x > sphere.x) {
    return sphere;
  }
  return box;
}

vec4 spheres(vec3 pos) {
  vec4 sphere = vec4(sphereSD(pos, 1.25), (RED+GREEN)*0.8);
  vec4 sphere2 = vec4(sphereSD(pos + 4.0, 1.25), BLUE*0.3 + sin(iTime)*0.025);

  vec3 sphere3Pos = vec3(pos.x - 4.0, pos.y + 3.0, pos.z + 4.0);
  float k = 0.009; // stretch factor
  vec3 ringsPos = sphere3Pos;
  float angle = 0.15;
  ringsPos.zy *= mat2(
    cos(angle), -sin(angle),
    sin(angle),  cos(angle)
  );
  ringsPos.xz *= mat2(k, 0.0, 0.0, 1.0);
  ringsPos.zy *= mat2(k, 0.0, 0.0, 1.0);
  vec4 sphere3 = vec4(sphereSD(sphere3Pos, 1.0), (GREEN+BLUE) * 0.5 + 0.1*sin(sphere3Pos.y*5.0));
  vec4 rings = vec4(sphereSD(ringsPos, 0.02), (RED+GREEN) * 0.2);
  rings.x = max(rings.x, -sphereSD(sphere3Pos, 1.5));
  rings.x = max(rings.x, sphereSD(sphere3Pos, 2.5));

  vec3 sphere4Pos = vec3(pos.x - 4.0, pos.y, pos.z - 4.0);
  vec4 sphere4 = vec4(sphereSD(sphere4Pos, 0.75), RED+BLUE);

  vec3 sphere5Pos = vec3(
    sphere4Pos.x + 1.5 * sin(iTime),
    sphere4Pos.y + 1.5 * cos(iTime),
    sphere4Pos.z + 1.5 * cos(iTime)
  );
  vec4 sphere5 = vec4(sphereSD(sphere5Pos, 0.15), ORANGE);

  vec4 result = sphere;
  if (result.x > sphere2.x) { result = sphere2; }
  if (result.x > sphere3.x) { result = sphere3; }
  if (result.x > sphere4.x) { result = sphere4; }
  if (result.x > sphere5.x) { result = sphere5; }
  if (result.x > rings.x)   { result = rings; }
  return result;
}

vec4 scene(vec3 pos) {
  vec4 spheres1 = spheres(pos);
  vec4 box = rotatingBox(pos);
  vec4 floor1 = vec4(
    flatPlaneSD(pos, -5.2),
    vec3(0.05, 0.05, 0.1)
  );

  vec4 result = spheres1;
  if (result.x > box.x) {
    result = box;
  }
  if (result.x > floor1.x) {
    result = floor1;
  }
  return result;
}

vec3 fog(vec3 color, vec3 fogColor, float dist) {
  float amount = 1.0 - exp(-dist / 10.0);
  return mix(color, fogColor, amount);
}

vec4 trace(vec3 origin, vec3 dir) {
  float depth = MIN_DIST;
  for (int i=0; i < MAX_MARCHING_STEPS; i+=1) {
    vec4 drgb = scene(origin + depth * dir);
    float dist = drgb.x;
    depth += dist;
    if (dist < EPSILON) {
      return vec4(depth, drgb.yzw);
    }
    if (depth >= MAX_DIST) {
      return vec4(MAX_DIST, vec3(0.0));
    }
  }
  return vec4(MAX_DIST, vec3(0.0));
}

vec3 estimateNormalFast(vec3 pos) {
  vec4 drgb = scene(pos);
  vec2 offset = vec2(0.001, 0.0);
  return normalize(vec3(
    scene(pos + offset.xyy).x,
    scene(pos + offset.yxy).x,
    scene(pos + offset.yyx).x
  ) - drgb.x);
}

vec3 estimateNormal(vec3 pos) {
  vec2 e = vec2(.005, 0.0);
	return normalize(vec3(
    scene(pos + e.xyy).x - scene(pos - e.xyy).x,
    scene(pos + e.yxy).x - scene(pos - e.yxy).x,
    scene(pos + e.yyx).x - scene(pos - e.yyx).x
  ));
}

vec4 render(vec3 origin, vec3 dir) {
  vec4 drgb = trace(origin, dir);

  float depth = drgb.x;
  if (depth == MAX_DIST) {
    return vec4(0.0);
  }

  vec3 hitPos = origin + depth * dir;
  vec3 normal = estimateNormal(hitPos);

  vec3 color = drgb.yzw;

  return vec4(depth, color);
}

vec3 getRayDirection(vec2 uv, vec3 origin, vec3 target, float fov) {
  vec3 forward = normalize(target - origin);
  vec3 right = -1.0 * normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = -1.0 * normalize(cross(forward, right));
  return normalize(uv.x * right + uv.y * up + forward * fov);
}

vec2 normalizeScreenCoords(vec2 fragCoord, vec2 resolution) {
  vec2 result = 2.0 * (fragCoord / resolution - 0.5);
  result.x *= resolution.x / resolution.y;
  return result;
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
  // vec3 lightPosition = vec3(4.0 * sin(iTime), 2.0, 4.0 * cos(iTime));
  vec3 lightPosition = vec3(0.0);
  vec3 lightIntensity = vec3(0.5, 0.5, 0.5);
  color += calcPhong(k_d, k_s, alpha, p, eye, lightPosition, lightIntensity);
  return color;
}

float Fresnel2(vec3 vNormal, vec3 vEyeDir) {
	float fresnel = 0.1 - dot( vNormal, vEyeDir ) * 0.05;
	return fresnel * fresnel;
}

float Fresnel(vec3 normal, vec3 camDir, vec3 ranges) {
	float f = Fresnel2(normal, camDir);
  float result;
	if (f > 0.5)
		result = mix( ranges.y, ranges.z, (2.0 * f)-1.0 );
	else
    result = mix( ranges.x, ranges.y, 2.0 * f);

	return result;
}

void main() {
  vec3 camPos = iCameraPosition;
  vec3 camDir = iCameraDirection;
  vec3 camTarget = camPos + camDir;
  float camFov = iCameraFov;

  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy, iResolution);
  vec3 rayDir = getRayDirection(uv, camPos, camTarget, camFov);
  vec4 result = trace(camPos, rayDir);

  vec3 color = result.yzw;
  vec3 origin = camPos;
  if (result.x == MAX_DIST) {
    color = vec3(0.1, 0.1, 0.2) * (rayDir.y * 0.5);
  }

  // Illumination
  vec3 K_a = vec3(0.1, 0.1, 0.1);
  vec3 K_d = vec3(0.1, 0.1, 0.1);
  vec3 K_s = vec3(0.8, 0.8, 0.8);
  float shininess = 20.0;
  vec3 hit = origin + rayDir * result.x;
  color += phongIllumination(K_a, K_d, K_s, shininess, hit, origin);

  if (result.x < MAX_DIST) {
    vec3 hitNormal = estimateNormal(hit);
    if (dot(rayDir, hitNormal) > -0.5) {
      color = mix(color, vec3(0.75), 0.1);
    }
  }
  color -= fog(color, vec3(0.15), result.x);

  // First reflection
  if (result.x < MAX_DIST) {
    vec3 hit = origin + rayDir * result.x;
    vec3 hitNormal = estimateNormal(hit);
    vec3 hitRayDir = reflect(rayDir, hitNormal);
    result = trace(hit + 0.001 * hitNormal, hitRayDir);
    color += 0.2 * result.yzw;
    origin = hit;
  }
  // Second reflection
  // if (result.x < MAX_DIST) {
  //   vec3 hit = origin + rayDir * result.x;
  //   vec3 hitNormal = estimateNormal(hit);
  //   vec3 hitRayDir = reflect(rayDir, hitNormal);
  //   result = trace(hit + 0.001 * hitNormal, hitRayDir);
  //   color += 0.1 * result.yzw;
  // }




  // color.xyz = pow(vec4(color, 1.0), vec4(1.0/2.2)).xyz;

  // TODO: figure out the depth diff
  gl_FragDepth = result.x / 5.3;
  gl_FragColor = vec4(color, 1.0);
}
