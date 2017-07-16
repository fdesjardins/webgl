import Inferno from 'inferno'

const vtxShader = `\
#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`

const fragShader = `\
#version 300 es

precision mediump float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}
`

const didMount = () => {
  console.log('mount')
  const canvas = document.querySelector('#scene')
  const gl = canvas.getContext('webgl2')
  const program = webglUtils.createProgramFromSources(gl, [
    vtxShader,
    fragShader
  ])
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")
  const colorLocation = gl.getUniformLocation(program, "u_color")
  const positionBuffer = gl.createBuffer()
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(
    positionAttributeLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  )

  const translation = [0, 0]
  const width = 100
  const height = 30
  const color = [Math.random(), Math.random(), Math.random(), 1]

  // draw the scene
  webglUtils.resizeCanvasToDisplaySize(gl.canvas)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(program)
  gl.bindVertexArray(vao)
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     0,  0,
    100,  0,
     0, 100,
     0, 100,
    100,  0,
    100, 100
  ]), gl.STATIC_DRAW)
  gl.uniform4fv(colorLocation, color)
  const primitiveType = gl.TRIANGLES
  const offset = 0
  const count = 6
  gl.drawArrays(primitiveType, offset, count)
}

const Canvas = () => {
  return (
    <canvas id='scene' />
  )
}

const Ex01 = () => {
  return (
    <Canvas onComponentDidMount={ didMount }/>
  )
}

export default Ex01
