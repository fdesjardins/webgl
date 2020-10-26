import React from 'react'
import * as twgl from 'twgl.js'

import { shouldUpdate, sq } from '-/utils'
import Example from '-/components/example'
import notes from './readme.md'
// import './Basics04.scss'
import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'

const initGL = (canvas, config) => {
  const gl = canvas.getContext('webgl2')
  const programInfo = twgl.createProgramInfo(gl, [vtxShader, fragShader])

  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

  return {
    gl,
    programInfo,
    bufferInfo,
  }
}

const didMount = ({ canvas, register }) => {
  const { gl, programInfo, bufferInfo } = initGL(canvas)

  const render = (time) => {
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    const uniforms = {
      time: time * 0.001,
      resolution: [gl.canvas.width, gl.canvas.height],
    }

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo)
    register(requestAnimationFrame(render))
  }
  register(requestAnimationFrame(render))
}

const Basics04 = ({ subscribe }) => {
  let requestAnimationFrameId
  const components = { Canvas: () => <canvas /> }
  return (
    <div className="basics02">
      <Example
        notes={notes}
        components={components}
        onComponentDidMount={() =>
          didMount({
            canvas: document.querySelector('.basics02 canvas'),
            register: (id) => {
              requestAnimationFrameId = id
            },
          })
        }
        onComponentWillUnmount={() =>
          cancelAnimationFrame(requestAnimationFrameId)
        }
        onComponentShouldUpdate={shouldUpdate}
      />
    </div>
  )
}

export default ({ children }, { store }) => {
  const subscribe = (callback) => {
    store
      .select(sq('ex1.scene'))
      .on('update', ({ data }) => callback(data.currentData))
  }
  return (
    <Basics04 subscribe={subscribe} onComponentShouldUpdate={shouldUpdate} />
  )
}
