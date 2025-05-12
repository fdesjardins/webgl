uniform vec2 iResolution;
uniform float iTime;
varying vec2 texCoord;
varying vec2 vUv; // [0:1]
uniform sampler2D iChannel0;
uniform bool iSphere;
uniform float iOffsetX;
uniform float iOffsetY;
uniform float iRotation;
uniform float iVb;
uniform float iVc;
uniform float iVd;
uniform float iEV;
uniform float iEr;
uniform float iEb;

float R = 100.0;

// Distortion coefficients

// vec2 uvStretched = (vUv * 2.0) - 0.5;
// float a = -0.12;
// float b = -0.168;
// float c = 0.0635;
// float d = -0.00;
// float e = -0.00079;

// Rampart
// float a = -0.12;
// float b = -0.2;
// float c = 0.086;
// float d = -0.00;
// float e = -0.0017;

// Thompson Pass (good)
float a = -0.0;
float b = -1.6;
float c = 0.5;
float d = 1.7;
float e = 2.0;

// Whittier - good
// float a = -0.;
// float b = -0.7;
// float c = 2.;
// float d = -18.8;
// float e = 105.;


// float a = -0.32;
// float b = -0.45;
// float c = 0.33;
// float d = -0.00;
// float e = -0.02;

// float focalLength = 3.0;
// float vfov = 58.0;
float hfov = 108.0;

float width = 1920.0;
float height = 1080.0;

vec2 brownConrady(vec2 xy, float a, float b, float c, float d)
{
    vec2 uv = xy * 2.0 - 1.0;	// brown conrady takes [-1:1]

    uv.y /= width/height;

    // Positive values of a,b,c,d give barrel distortion, negative give pincushion
    float r = sqrt(uv.x*uv.x + uv.y*uv.y);
    float r2 = pow(r, 2.0);
    float r3 = pow(r, 3.0);
    float r4 = pow(r, 4.0);
    float r6 = pow(r, 6.0);
    uv.x *= 1.00 + a * r + b * r2 + c * r3 + d * r4 + e*r6;
    uv.y *= 1.00 + a * r + b * r2 + c * r3 + d * r4 + e*r6;

    uv.y *= width/height;

    // Tangential distortion (due to off center lens elements)
    // is not modeled in this function, but if it was, the terms would go here

    uv = (uv * .5 + .5);	// restore -> [0:1]
    return uv;
}

vec2 scaleWarped(vec2 uv, vec2 factor) {
  vec2 xy = (uv - .5) * 2.0;
  // factor = brownConrady(factor, a, b, c, d);
  xy.x *= factor.x;
  xy.y *= factor.y;
  return xy / 2.0 + 0.5;
}

vec2 scale2(vec2 uv, vec2 factor) {
  vec2 xy = uv;
  uv.x *= 2.0;
  return uv;
}

// vec2 simple(vec2 uv, float focalLength) {
//   uv = uv * 2.0 - 1.0; //[-1:1]
//   float r = sqrt(uv.x*uv.x + uv.y*uv.y);
//   uv *= 2.0 * r / focalLength;
//   uv = (uv * .5 + .5);	// restore -> [0:1]
//   return uv;
// }

vec2 sphericalWarp(vec2 uv, float z) {
  vec2 xy = (uv - .5) * 2.0;
  xy = vec2(xy.x/z, xy.y/6./z);
  return xy / 2.0 + 0.5;
}

mat2 rotate2d(float theta){
  return mat2(cos(theta), -sin(theta),
              sin(theta),  cos(theta));
}

vec2 rotate(vec2 uv, float theta) {
  vec2 xy = (uv - .5) * 2.0;
  xy *= rotate2d(theta);
  return xy / 2.0 + 0.5;
}

float correctVignette(vec2 uv, float b, float c, float d) {
  vec2 xy = (uv - .5) * 2.0;
  float r = sqrt(uv.x*uv.x + uv.y*uv.y);
  float r2 = pow(r, 2.0);
  float r4 = pow(r, 4.0);
  float r6 = pow(r, 6.0);
  float correction = 0.0 + b*r2 + c*r4 + d*r6;
  return correction;
}

void main() {
    // Cut off top and bottom
  if (vUv.y < .38) {
    gl_FragColor = vec4(vec3(0.0), 1.0);
    return;
  }
  if (vUv.y > .7) {
    gl_FragColor = vec4(vec3(0.0), 1.0);
    return;
  }

  vec2 uvStretched = vUv;

  vec3 vigCorr;
  if (iSphere) {
    // uvStretched.x += iOffsetX;
    uvStretched.y -= iOffsetY/4.;
    // uvStretched = scaleWarped(vUv, vec2(4.6, 5));
    uvStretched = scaleWarped(uvStretched, vec2(.387,1.));
    uvStretched = scaleWarped(uvStretched, vec2(1.,1.7));
  } else {
    // Without spherical warp
    uvStretched = scaleWarped(vUv, vec2(4.55, 5));
  }

  vec2 uvDewarped;
  uvDewarped = brownConrady(
    uvStretched,
    a,
    b,
    c,
    d
  );

  vigCorr = vec3(0.) + correctVignette(uvDewarped, iVb, iVc, iVd);

  if (iSphere) {
    uvDewarped = sphericalWarp(uvDewarped, 0.1);
  }
  // uvDewarped = rotate(uvDewarped, iRotation);



  // uvDewarped.x += -0.5;

  // Scale to vertical and horizontal fov
  // uvDewarped = scaleWarped(uvDewarped, vec2(1.28, 1.125));
  // uvDewarped = scaleWarped(uvDewarped, vec2(2., 2.));

  float xMax = 0.95;
  float xMin = 0.05;

  // Sample texture
  uvDewarped.x *= -1.; // Flip horizontally
  uvDewarped.x += 1.;  // Re-align
  uvDewarped = rotate(uvDewarped, iRotation);
  if (uvDewarped.x < xMax && uvDewarped.x > xMin) {
    gl_FragColor = vec4(texture(iChannel0, uvDewarped).rgb, 1.0);
    // return;
  } else {
    gl_FragColor = vec4(texture(iChannel0, uvDewarped).rgb, 0.0);
    // return;
  }

  // Vignette correction

  gl_FragColor.rgb -= vigCorr*1.;
  gl_FragColor.rgb += gl_FragColor.rgb * iEV/16.;
  // gl_FragColor.r *= (1.-iEr)*.25+1.;
  // gl_FragColor.b *= (1.-iEb)*.25+1.;

  // Overlap area
  // Rampart
  // float overlap = .35;
  float overlap = 0.5;
  // if (vUv.y > 0.65) {
  //   overlap = 0.35;
  // }
  float aMult = 20.;

  if (uvDewarped.x > 0.0 && uvDewarped.x < overlap) {
    // float alpha = uvDewarped.x / (overlapDegrees/360.0);
    // gl_FragColor.rgb += vec3(0.1, 0.0, alpha);
    // gl_FragColor.r += 0.1;
    gl_FragColor.a = uvDewarped.x / overlap;
    gl_FragColor.a *= aMult;
  }
  if (uvDewarped.x < 1. && uvDewarped.x >  1.0 - overlap) {
    // float alpha = uvDewarped.x / (overlapDegrees/360.0);
    // gl_FragColor.rgb += vec3(0.1, 0.0, alpha);
    // gl_FragColor.r += 0.1;
    gl_FragColor.a = (1.0 - uvDewarped.x) / overlap;
    gl_FragColor.a *= aMult;
  }

  // gl_FragColor.a = 0.75;

  // Black outside image area
  if (uvDewarped.x < 0.0 || uvDewarped.x > 1.0 || uvDewarped.y < 0.0 || uvDewarped.y > 1.0) {
    // gl_FragColor = vec4(vec3(0.0), 0.0);
  }

  // Draw equatorial line
  if (vUv.y > .5 - 2e-4 && vUv.y < .5 + 1e-4) {
    // gl_FragColor = vec4(1.0, 0., 0., 1.);
  }
  // Draw vertical alignment lines
  // int nLines=36;
  // for (int a=0; a<=nLines; a+=1){
  //   if (vUv.x > float(a)/float(nLines) - 1e-4 && vUv.x < float(a)/float(nLines) + 1e-4) {
  //     gl_FragColor = vec4(1.0, 0., 0., 1.);
  //   }
  // }


  // Show one 'quadrant' width
  if (iSphere) {
    // if (vUv.x > 0.375 && vUv.x <= 0.625) {
    //   gl_FragColor += 0.1;
    // }
    // if (vUv.x <= 0.375 && vUv.x > 0.35) {
    //   gl_FragColor.r += 0.1;
    // }

    // Chop off area where texture gets mirrored
    if (vUv.x < 0.28) {
      gl_FragColor = vec4(0.0);
    }
    if (vUv.x > 0.72) {
      gl_FragColor = vec4(0.0);
    }
  }
}
