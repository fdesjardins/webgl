import Inferno from 'inferno'

import { default as utils, sq } from '-/utils'
import './Ex02.scss'
import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'

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

const Ex02 = ({ scene, controls, subscribe }) => {
  return (
    <div>
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
    <Ex02
      scene={ store.select(sq('ex1.scene')).get() }
      controls={ store.select(sq('ex1.controls')).get() }
      subscribe={ subscribe }
      onComponentShouldUpdate={ utils.shouldUpdate }
    />
  )
}
