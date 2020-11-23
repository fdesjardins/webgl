import React from 'react'
import * as twgl from 'twgl.js'

import Example from '-/components/example'
import notes from './readme.md'
import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'

const initGL = (canvas, config) => {
  const gl = canvas.getContext('webgl2')
  const programInfo = twgl.createProgramInfo(gl, [vtxShader, fragShader])

  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

  return {
    gl,
    programInfo,
    bufferInfo
  }
}

const init = ({ canvas }) => {
  const { gl, programInfo, bufferInfo } = initGL(canvas)

  const render = (time) => {
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
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

const E = () => (
  <Example notes={notes} init={init} />
)

export default E
