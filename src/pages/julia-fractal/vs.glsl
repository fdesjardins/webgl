varying vec2 vUv;
varying vec2 surfacePosition;

void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
  surfacePosition = gl_Position.xz;
}
