varying vec2 texCoord;
varying vec2 vUv;

void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
  texCoord = vec2(gl_Position.x, gl_Position.y);
}
