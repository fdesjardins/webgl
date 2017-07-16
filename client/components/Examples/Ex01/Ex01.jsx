import Inferno from 'inferno'

import { default as utils, sq } from '-/utils'

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

const didMount = (scene, subscribe) => () => {
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

  const drawScene = ({ pos, width, height, color }) => {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindVertexArray(vao)
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const x1 = pos.x
    const x2 = x1 + width
    const y1 = pos.y
    const y2 = y1 + height
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
    ]), gl.STATIC_DRAW)
    gl.uniform4fv(colorLocation, color)
    const primitiveType = gl.TRIANGLES
    const offset = 0
    const count = 6
    gl.drawArrays(primitiveType, offset, count)
  }

  subscribe(drawScene)
  drawScene(scene)
}

const Canvas = () => {
  return (
    <canvas id='scene' />
  )
}

const Controls = ({ moveLeft, moveRight, moveUp, moveDown }) => {
  return (
    <div class='controls'>
      <button onClick={ () => moveLeft(15) }>left</button>
      <button onClick={ () => moveRight(15) }>right</button>
      <button onClick={ () => moveUp(15) }>up</button>
      <button onClick={ () => moveDown(15) }>down</button>
    </div>
  )
}

const Ex01 = ({ scene, controls, subscribe }) => {
  return (
    <div class='ex1'>
      <Canvas onComponentDidMount={ didMount(scene, subscribe) }/>
      <Controls
        moveLeft={ controls.moveLeft }
        moveRight={ controls.moveRight }
        moveUp={ controls.moveUp }
        moveDown={ controls.moveDown }
      />
    </div>
  )
}

export default ({ children }, { store }) => {
  const subscribe = callback => {
    store.select(sq('ex1.scene')).on('update', ({ data }) => callback(data.currentData))
  }
  return (
    <Ex01
      scene={ store.select(sq('ex1.scene')).get() }
      controls={ store.select(sq('ex1.controls')).get() }
      subscribe={ subscribe }
      onComponentShouldUpdate={ utils.shouldUpdate }
    />
  )
}
