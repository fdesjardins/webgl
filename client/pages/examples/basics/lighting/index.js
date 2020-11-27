import React from 'react'
import PT from 'prop-types'
import * as twgl from 'twgl.js'
import _ from 'lodash'

import Example from '-/components/example'
import notes from './readme.md'

import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'
import cube, { tex as cubeTex } from '-/assets/cube'

const globals = {
  uniforms: {
    u_lightWorldPos: [10, 10, -10],
    u_lightColor: [1, 1, 1, 1],
    u_ambient: [0.2, 0.2, 0.2, 1],
    u_specular: [0.8, 0.8, 0.8, 1],
    u_shininess: 100,
    u_specularFactor: 10,
    u_diffuse: null,
    u_alpha: 0.7,
  },
}

const initGL = (canvas, config) => {
  const gl = canvas.getContext('webgl')
  const programInfo = twgl.createProgramInfo(gl, [vtxShader, fragShader])

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, cube)

  const tex = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: cubeTex,
  })

  return {
    gl,
    programInfo,
    bufferInfo,
    tex,
  }
}

// update scene based on time elapsed
const animateScene = (updateFns) => {
  let then = 0
  return () => {
    const now = new Date().getTime()
    if (then !== 0) {
      const elapsed = now - then
      updateFns.map((f) => f(elapsed))
    }
    then = now
  }
}

const init = ({ canvas, uniforms }) => {
  const { gl, programInfo, bufferInfo, tex } = initGL(canvas)
  const m4 = twgl.m4

  uniforms.u_diffuse = tex

  let worldRotationY = 0
  const animate = animateScene([
    (time) => {
      worldRotationY += time * 0.001
    },
  ])

  const render = (time) => {
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const fov = (30 * Math.PI) / 180
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.5
    const zFar = 10
    const projection = m4.perspective(fov, aspect, zNear, zFar)
    const eye = [1, 4, -6]
    const target = [0, 0, 0]
    const up = [0, 1, 0]
    const camera = m4.lookAt(eye, target, up)
    const view = m4.inverse(camera)
    const viewProjection = m4.multiply(projection, view)
    const world = m4.rotationY(worldRotationY)

    uniforms.u_viewInverse = camera
    uniforms.u_world = world
    uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world))
    uniforms.u_worldViewProjection = m4.multiply(viewProjection, world)

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0)

    animate()
    requestAnimationFrame(render)
  }
  render()
}

const Lighting = ({ color }) => {
  const canvas = React.useRef(null)
  React.useEffect(() => {
    return init({
      canvas: canvas.current,
      uniforms: _.merge({}, globals.uniforms, { u_lightColor: color }),
    })
  })
  return <canvas ref={canvas} />
}
Lighting.propTypes = {
  color: PT.array,
}

const Default = () => (
  <Example notes={notes} components={{ Lighting }} init={() => () => {}} />
)

export default Default
