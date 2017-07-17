import Inferno from 'inferno'

import { default as utils, sq } from '-/utils'
import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'
import cube from './cube'

const initGL = (canvas, config) => {
  const gl = canvas.getContext('webgl2')

  const program = webglUtils.createProgramFromSources(gl, [
    config.shaders.vertex,
    config.shaders.fragment
  ])

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  const colorLocation = gl.getUniformLocation(program, 'u_color')

  // position buffer
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.vertexAttribPointer(
    positionAttributeLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  )

  return {
    gl,
    scene: {
      vao,
      program,
      buffers: {
        position: positionBuffer
      },
      attrib: {
        position: positionAttributeLocation,
        resolution: resolutionUniformLocation,
        color: colorLocation
      }
    }
  }
}

const didMount = ({ canvas, subscribe }) => {

  const { gl, scene } = initGL(canvas, {
    shaders: {
      vertex: vtxShader,
      fragment: fragShader
    }
  })

  const drawScene = ({ pos, width, height, color }) => {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(scene.program)
    gl.bindVertexArray(scene.vao)
    gl.uniform2f(scene.attrib.resolution, gl.canvas.width, gl.canvas.height)
    gl.bindBuffer(gl.ARRAY_BUFFER, scene.buffers.position)

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube), gl.STATIC_DRAW)

    gl.uniform4fv(scene.attrib.color, color)
    const primitiveType = gl.TRIANGLES
    const offset = 0
    const count = 6
    gl.drawArrays(primitiveType, offset, count)
  }

  // subscribe(drawScene)
  drawScene({
    pos: {
      x: 0,
      y: 0
    },
    width: 25,
    height: 25,
    color: [ Math.random(), Math.random(), Math.random(), 1 ]
  })
}

const Canvas = () => {
  return (
    <canvas id='scene' />
  )
}

const Ex03 = ({ subscribe }) => {
  return (
    <div>
      <Canvas onComponentDidMount={ () => didMount({
        canvas: document.querySelector('#scene'),
        subscribe
      }) }/>
    </div>
  )
}

export default ({ children }, { store }) => {
  const subscribe = callback => {
    store.select(sq('ex1.scene')).on('update', ({ data }) => callback(data.currentData))
  }
  return (
    <Ex03
      subscribe={ subscribe }
      onComponentShouldUpdate={ utils.shouldUpdate }
    />
  )
}
