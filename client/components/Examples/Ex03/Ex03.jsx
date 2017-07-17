import Inferno from 'inferno'

import { default as utils, sq } from '-/utils'
import Markdown from '-/components/Markdown/Markdown'
import UpDownLeftRight from '-/components/Controls/UpDownLeftRight/UpDownLeftRight'
import './Ex03.scss'
import notes from './Ex03.md'
import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'

const didMount = (scene, subscribe) => () => {
  const canvas = document.querySelector('#ex03')
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
    const quad = [
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.STATIC_DRAW)
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
    <canvas id='ex03' />
  )
}

const Ex02 = ({ scene, controls, subscribe }) => {
  return (
    <div class='ex03'>
      <Markdown text={ notes } />
      <UpDownLeftRight
        onLeft={ () => controls.moveLeft(25) }
        onRight={ () => controls.moveRight(25) }
        onUp={ () => controls.moveUp(25) }
        onDown={ () => controls.moveDown(25) }
      />
      <Canvas onComponentDidMount={ didMount(scene, subscribe) }/>
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
