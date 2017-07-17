#version 300 es

precision mediump float;

uniform vec2 resolution;
uniform float time;

out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float color = 0.0;
  color += sin( uv.x * cos( time / 3.0 ) * 60.0 ) + cos( uv.y * cos( time / 2.80 ) * 10.0 );
  color += sin( uv.y * sin( time / 2.0 ) * 40.0 ) + cos( uv.x * sin( time / 1.70 ) * 40.0 );
  color += sin( uv.x * sin( time / 1.0 ) * 10.0 ) + sin( uv.y * sin( time / 3.50 ) * 80.0 );
  color *= sin( time / 10.0 ) * 0.5;

  outColor = vec4( vec3( color, color * .5, tan( color + time / 2.5 ) * 0.25), 1.0 );
}
