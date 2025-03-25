uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;
uniform float iCameraFov;

varying vec2 texCoord;
varying vec2 vUv;

const int MAX_MARCHING_STEPS = 250;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

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
  // vec3 u = t * t * (3.0 - 2.0*t);
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

float fbm(vec3 pos) {
  float f = 0.0;

  // Here we construct a rotation matrix using Pythagorean
  // triples to avoid using sin and cos
  mat3 m = mat3(
    1.6,-1.2, 0.0,
    1.2, 1.6, 1.2,
    0.0,-1.2, 1.6
  );

  f = 0.5        * noise(pos); pos *= m;
  f += 0.25      * noise(pos); pos *= m;
  f += 0.125     * noise(pos); pos *= m;
  // float f1 = f;
  f += 0.0625    * noise(pos); pos *= m;
  f += 0.03125   * noise(pos); pos *= m;
  // f += 0.015625  * noise(pos); pos *= m;
  // f += 0.0078125 * noise(pos); pos *= m;

  // f = 0.5 * (0.5 + f);
  // f = clamp(f, 0.0, 1.0);
  // f1 = clamp(f1, 0.0, 1.0);
  f = 0.5*f + 0.5;

  return f;
}


vec3 lightPos() {
  return vec3(0.0,25.0,0.0);
}

// https://iquilezles.org/articles/distfunctions/
// float smoothUnion(float d1, float d2, float k) {
//   float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
//   return mix( d2, d1, h ) - k*h*(1.0-h);
// }

vec4 scene(vec3 pos) {
  vec3 bpos = pos;
  // return vec4(sphereSD(pos, 1.0), vec3(1.0));
  vec4 clouds = vec4(boxSD(pos, vec3(10.0,2.,10.)), vec3(1.0));
  vec4 light = vec4(sphereSD(pos-lightPos(), 0.3), vec3(1.0));
  if (light.x < clouds.x) {
    return light;
  }
  return clouds;
}

float calcAO(vec3 pos, vec3 normal) {
	float occ = 0.0;
  float sca = 1.0;
  for( int i=0; i<5; i++ )
  {
    float h = 0.01 + 0.12*float(i)/4.0;
    float d = scene(pos + h*normal).x;
    occ += (h-d)*sca;
    sca *= 0.95;
  }
  return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );
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


vec4 through(vec3 origin, vec3 dir) {
  float depth = MIN_DIST;
  // vec4 color = vec4(1.0, 1.0, 1.0, 0.0);
  vec4 color = vec4(0.0);
  vec3 n = estimateNormalFast(origin);
  for (int i=0; i < MAX_MARCHING_STEPS; i+=1) {
    // if (color.a > 0.99) {
    //   break;
    // }
    vec4 drgb = scene(origin + depth * dir);
    vec3 pos = origin+dir*depth;
    vec3 fbmPos = pos/4. + vec3(0.5, -0.3, 0.0)*iTime/3.0;
    float density = fbm(fbmPos);
    // float density = 1.0;
    // pos.x *= 20.0;
    density += sin(iTime*0.1)*0.01;
    float dist = drgb.x;
    depth += 0.075;
    // color += vec3(density);
    if (dist < EPSILON) {
      if (density >.75) {
        color.rgb += 0.01*density;
        // color.rgb -= density * 0.05;
        // color.rgb -= 0.02 * density / (distance(pos, lightPos()/1.)/4.0);

        // color.rgb += -0.02 * density;
        color.rgb += 0.01*density / pow(distance(pos,lightPos())/2.0, 2.0);

        // darken bottom
        // if (dot(pos/4.))

        // self-occlusion to light
        vec3 toLight = normalize(lightPos() - pos);
        float density2 = fbm(fbmPos + toLight*0.02);
        if (density2 >= .8) {
          color.rgb += vec3(1.0)*min(0.0, 0.15*density2);
          // color.rgb = vec3(0.);
        }

        color.rgb -= 0.01*dot(pos, vec3(0.0,-1.0,0.0));
        // color.rg += 0.025*dot(pos, vec3(0.0,1.0,0.0));
        // color.rgb += 0.5*calcAO(fbmPos, normalize(lightPos() - pos));

        // color.rgb -= 0.1*density * abs(dot(pos,lightPos())) / (distance(pos, lightPos())/1.0);
        // color.a += 0.001;
        // color.a = 0.2;
        // color += 0.01*mix(color, vec4(drgb.yzw,density/2.0), density/12.0);
        // color *= 1.0-dot(origin+depth, lightPos());
        // color += .1*dot(origin + depth, lightPos())/distance(origin + depth, lightPos());
      } else {
        // color = vec4(1.0,1.0,1.0,0.0);
        // color = behind;
      }

      continue;
    }
    // dir += n * 0.1;
    vec3 posteriorPos = origin + dir * depth + dir;
    // vec3 n2 = estimateNormalFast(posteriorPos);
    // dir += n2 * 0.1;

    vec4 behind = trace(posteriorPos, dir);
    if (behind.x >= MAX_DIST) {
      color = mix(color, vec4(0.,0.,0.,0.), 0.0);
    }

    // vec3 c = mix(color, behind.yzw - color, 0.1);
    // color.a = 1.0;
    return color;
  }
  // return vec4(MAX_DIST, vec3(0.0));
  return vec4(0.0);
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

void main() {
  vec3 camPos = iCameraPosition;
  vec3 camDir = iCameraDirection;
  vec3 camTarget = camPos + camDir;
  float camFov = iCameraFov;

  vec2 uv = normalizeScreenCoords(gl_FragCoord.xy, iResolution);
  vec3 rayDir = getRayDirection(uv, camPos, camTarget, camFov);
  vec4 result = trace(camPos, rayDir);
  vec3 color = result.yzw;

  // if (result.x >= MAX_DIST) {
  //   gl_FragColor = vec4(0.,0.,0.,1.);
  //   gl_FragColor.b += rayDir.y/2.;
    // return;
  // }

  vec3 origin = camPos + result.x * rayDir + rayDir * (EPSILON + 0.01);
  vec4 otherSide = through(origin, rayDir);
  // color = vec3(otherSide.yzw);
  // origin = camPos + otherSide.x * rayDir + (EPSILON + 0.01) * rayDir;

  // vec4 final = trace(origin, rayDir);
  // color = mix(color, final.yzw, 1.0);
  // color =

  // vec3 pos = camPos + rayDir*result.x;
  // vec3 normal = estimateNormalFast(pos);
  // float occ = calcAO(pos+normal*0.001, normal) * 1.5;
  // color *= occ;

  // gamma correction
  color.xyz = pow(vec4(color, 1.0), vec4(1.0/2.2)).xyz;

  gl_FragColor = vec4(color, 1.0);
  gl_FragColor = vec4(0.7,0.75,0.95,1.);
  // gl_FragColor.b += rayDir.y/2.;
  // gl_FragColor.b = 0.;
  // if (otherSide.b > 0.0) {
    gl_FragColor = mix(gl_FragColor, vec4(otherSide.rgb,1.0), .4);
    // gl_FragColor -= 0.01*dot(
    //   estimateNormalFast(origin+rayDir*result.x),
    //   lightPos()
    // );
    // gl_FragColor -= vec4(otherSide.rgb, 1.0);
  // }
  // gl_FragColor = mix(vec4(color, 0.5), otherSide, 0.75);
}
