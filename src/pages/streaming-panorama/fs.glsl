varying vec2 texCoord;
varying vec2 vUv;

uniform int imageNum;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform sampler2D iChannel4;
uniform sampler2D iChannel5;
uniform sampler2D iChannel6;
uniform sampler2D iChannel7;
uniform sampler2D iChannel8;

mat2 rotate2d(float theta){
  return mat2(cos(theta), -sin(theta),
              sin(theta),  cos(theta));
}

mat2 scale(float sx, float sy){
  return mat2(1.0/sx, 0.0,
              0.0,    1.0/sy);
}

vec2 distort(vec2 uv, float k1, float k2, float k3)
{
    uv = uv * 2.0 - 1.0;	// brown conrady takes [-1:1]

    // positive values of K1 give barrel distortion, negative give pincushion
    float r2 = uv.x*uv.x + uv.y*uv.y;
    uv.x *= 1.0 + k1 * r2 + k2 * r2 * r2;

    // tangential distortion (due to off center lens elements)
    // is not modeled in this function, but if it was, the terms would go here

    uv = (uv * .5 + .5);	// restore -> [0:1]
    return uv;
}

vec2 distortY(vec2 uv, float k1, float k2, float k3)
{
    uv = uv * 2.0 - 1.0;	// brown conrady takes [-1:1]

    // positive values of K1 give barrel distortion, negative give pincushion
    float r2 = uv.x*uv.x + uv.y*uv.y;
    uv.y *= 1.0 + k1 * r2 + k2 * r2 * r2;

    // tangential distortion (due to off center lens elements)
    // is not modeled in this function, but if it was, the terms would go here

    uv = (uv * .5 + .5);	// restore -> [0:1]
    return uv;
}

vec2 distort1(vec2 uv, float a, float b, float c)
{
    uv = uv * 2.0 - 1.0;	// brown conrady takes [-1:1]

    // positive values of K1 give barrel distortion, negative give pincushion
    float r2 = uv.x*uv.x + uv.y*uv.y;
    float d = 1.0 - (a + b + c);
    uv *= (a*pow(r2, 3.0) + b*pow(r2, 2.0) + c*r2 + d)*r2;

    // tangential distortion (due to off center lens elements)
    // is not modeled in this function, but if it was, the terms would go here

    uv = (uv * .5 + .5);	// restore -> [0:1]
    return uv;
}

vec4 map(int channel, vec2 uv){
  vec4 res = vec4(0.0);
  switch (channel) {
  case 0: res = texture(iChannel0, uv); break;
  case 1: res = texture(iChannel1, uv); break;
  case 2: res = texture(iChannel2, uv); break;
  case 3: res = texture(iChannel3, uv); break;
  case 4: res = texture(iChannel4, uv); break;
  case 5: res = texture(iChannel5, uv); break;
  case 6: res = texture(iChannel6, uv); break;
  case 7: res = texture(iChannel7, uv); break;
  case 8: res = texture(iChannel8, uv); break;
  }
  return res;
}

void main(){
  float vfov = 2.0;
  vec2 uv = vec2(vUv);
  int channel = 99;
  float lighten = 1.0;

  float distortA = -0.085;
  float distortB = 0.000;
  float distortC = 0.00;
  float vshift = 0.05;

  if (imageNum == 0) {
    if (vUv.x <= 0.27) {
      channel = 0;
      uv.x = 1.0 - (uv.x - 0.012) * 4.0;
      uv.y += vshift;
      uv = distort(uv, distortA, distortB, distortC);
      uv.y -= vshift;
      // uv *= rotate2d(radians(0.2));
      // lighten = 1.2;
    }
  }

  if (imageNum == 3) {
    if (vUv.x <= 2.0 * 0.27 && vUv.x > 0.25) {
      channel = 3;
      uv.x = 1.0 - (uv.x - 0.27) * 4.05;
      uv.y += vshift;
      uv = distort(uv, distortA, distortB, distortC);
      uv.y -= vshift;
      // uv *= rotate2d(radians(0.5));
      // uv.y += 0.01;
      lighten = 1.1;
    }
  }

  if (imageNum == 2) {
    if (vUv.x <= 3.0 * 0.28 && vUv.x > 0.5) {
      channel = 2;
      uv.x = 1.0 - (uv.x - 0.5225) * 4.05;
      uv.y += vshift;
      uv = distort(uv, distortA, distortB, distortC);
      uv.y -= vshift;
      // uv *= rotate2d(radians(0.5));
      // uv.y += 0.03;
      lighten = 1.0;
    }
  }
  //
  if (imageNum == 1) {
    if (vUv.x <= 4.2 * 0.27 && vUv.x > 0.75) {
      channel = 1;
      uv.x = 1.0 - (uv.x - 0.751) * 4.05;
      uv.y += vshift;
      uv = distort(uv, distortA, distortB, distortC);
      uv.y -= vshift;
      // uv *= rotate2d(radians(-0.2));
      uv.y += 0.008;
    }
  }

  float blendFactor = 24.0;
  // Set the color to black instead of allowing the texture to repeat
  if (uv.y < 0.0 || uv.y > 1.0 || uv.x < 0.0 || uv.x > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    // Linear blend the edges
    if (channel != 99) {
      gl_FragColor = map(channel, uv) * lighten;
      if (uv.x > 0.85 && vUv.x > 0.15 && vUv.x < 0.85) {
        gl_FragColor.a = min(1.0, (1.0 - uv.x) * blendFactor);
      } else {
        gl_FragColor.a = min(1.0, uv.x * blendFactor);
      }
    }
  }

  // Chop a little off the top and bottom for a clean edge
  if (vUv.y < 0.025 || vUv.y > 0.9) {
    gl_FragColor = vec4(0.0);
  }
}
