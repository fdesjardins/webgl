import React from 'react'
import { webglUtils } from './webgl-utils.js'
// import UpDownLeftRight from '-/components/controls/up-down-left-right'

// import Example from '-/components/example'
// import notes from './readme.md'
import vtxShader from './vs.glsl'
import fragShader from './fs.glsl'
import Baobab from 'baobab'

const state = new Baobab({
  pos: { x: 0, y: 0 },
  width: 50,
  height: 50,
  color: [Math.random(), Math.random(), Math.random(), 1],
})

const init = ({ canvas, container }) => {
  const gl = canvas.getContext('webgl2')
  const program = webglUtils.createProgramFromSources(gl, [vtxShader, fragShader])
  const positionAttributeLocation = gl.getAttribLocation(program, 'position')
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  const colorLocation = gl.getUniformLocation(program, 'u_color')
  const positionBuffer = gl.createBuffer()
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

  const drawScene = ({ pos, width, height, color }) => {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindVertexArray(vao)
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const x1 = pos.x
    const x2 = x1 + width
    const y1 = pos.y
    const y2 = y1 + height
    const quad = [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.STATIC_DRAW)
    gl.uniform4fv(colorLocation, color)
    const primitiveType = gl.TRIANGLES
    const offset = 0
    const count = 6
    gl.drawArrays(primitiveType, offset, count)
  }

  state.on('update', () => drawScene(state.toJSON()))
  drawScene(state.toJSON())
  setInterval(() => drawScene(state.toJSON()), 3e3)
}

const HelloWorld = () => {
  React.useEffect(() => {
    const canvas = document.querySelector('canvas')
    const container = document.querySelector('#container')
    if (init) {
      const dispose = init({ canvas, container })
      return () => {
        if (typeof dispose === 'function') {
          dispose()
        }
      }
    }
  })
  // const Controls = () => (
  //   <UpDownLeftRight
  //     onLeft={() => state.select(['pos', 'x']).apply((x) => x - 50)}
  //     onRight={() => state.select(['pos', 'x']).apply((x) => x + 50)}
  //     onUp={() => state.select(['pos', 'y']).apply((x) => x - 50)}
  //     onDown={() => state.select(['pos', 'y']).apply((x) => x + 50)}
  //   />
  // )
  // const components = {
  //   Controls,
  // }
  return (
    <>
      <div id="container">
        <canvas />
      </div>
    </>
  )
}

export default HelloWorld
