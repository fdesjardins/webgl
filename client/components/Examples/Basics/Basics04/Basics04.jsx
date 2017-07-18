import Inferno from 'inferno'
import twgl from 'twgl.js'

import { default as utils, sq } from '-/utils'
import Example from '-Example'
import cube from '-/components/Examples/Basics/cube-object'

import notes from './readme.md'
import './Basics04.scss'
import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'

const initGL = (canvas, config) => {
  const gl = canvas.getContext('webgl2')
  const programInfo = twgl.createProgramInfo(gl, [
    vtxShader,
    fragShader
  ])

  const arrays = {
    position: [
      -1, -1, 0,
      1, -1, 0,
      -1, 1, 0,
      -1, 1, 0,
      1, -1, 0,
      1, 1, 0
    ]
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

  return {
    gl,
    programInfo,
    bufferInfo
  }
}

const didMount = ({ canvas, register }) => {
  const { gl, programInfo, bufferInfo } = initGL(canvas)

  const render = time => {
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    const uniforms = {
      time: time * 0.001,
      resolution: [gl.canvas.width, gl.canvas.height]
    }

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo)
    register(requestAnimationFrame(render))
  }
  register(requestAnimationFrame(render))
}

const Canvas = () => {
  return (
    <canvas id='ex04' />
  )
}

const Basics04 = ({ subscribe }) => {
  let requestAnimationFrameId
  // return (
  //   <div>
  //     <Markdown text={ notes } />
  //     <Canvas
  //       onComponentDidMount={ () => didMount({
  //         canvas: document.querySelector('#ex04'),
  //         register: id => { requestAnimationFrameId = id }
  //       }) }
  //       onComponentWillUnmount={ () => cancelAnimationFrame(requestAnimationFrameId) }
  //     />
  //   </div>
  // )
  const components = { Canvas: () => <Canvas/> }
  return (
    <div class='basics02'>
      <Example
        notes={ notes }
        components={ components }
        onComponentDidMount={ () => didMount({
          canvas: document.querySelector('#ex04'),
          register: id => { requestAnimationFrameId = id }
        }) }
        onComponentWillUnmount={ () => cancelAnimationFrame(requestAnimationFrameId) }
        onComponentShouldUpdate={ utils.shouldUpdate } />
    </div>
  )
}

export default ({ children }, { store }) => {
  const subscribe = callback => {
    store.select(sq('ex1.scene')).on('update', ({ data }) => callback(data.currentData))
  }
  return (
    <Basics04
      subscribe={ subscribe }
      onComponentShouldUpdate={ utils.shouldUpdate }
    />
  )
}
