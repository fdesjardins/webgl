import Inferno from 'inferno'
import twgl from 'twgl.js'
import _ from 'lodash'

import { default as utils, sq } from '-/utils'
import Example from '-Example'

import notes from './readme.md'
import './Basics05.scss'
import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'
import { default as cube, tex as cubeTex } from './cube'

const initGL = (canvas, config) => {
  const gl = canvas.getContext('webgl2')
  const programInfo = twgl.createProgramInfo(gl, [
    vtxShader,
    fragShader
  ])

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, cube)

  const tex = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: cubeTex
  })

  return {
    gl,
    programInfo,
    bufferInfo,
    tex
  }
}

// update scene based on time elapsed
const animateScene = updateFns => {
  let then = 0
  return () => {
    const now = new Date().getTime()
    if (then !== 0) {
      const elapsed = now - then
      updateFns.map(f => f(elapsed))
    }
    then = now
  }
}

const didMount = ({ canvas, register, uniforms }) => {
  const { gl, programInfo, bufferInfo, tex } = initGL(canvas)
  const m4 = twgl.m4

  uniforms = _.merge({}, uniforms)
  uniforms.u_diffuse = tex

  let worldRotationY = 0
  const animate = animateScene([
    time => { worldRotationY += time * .001 }
  ])

  const render = time => {
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const fov = 30 * Math.PI / 180
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
    register(requestAnimationFrame(render))
  }
  register(requestAnimationFrame(render))
}

const Basics05 = ({ subscribe, uniforms }) => {
  let requestAnimationFrameId
  const components = { Canvas: () => <canvas/> }
  return (
    <div class='basics05'>
      <Example
        notes={ notes }
        components={ components }
        onComponentDidMount={ () => didMount({
          canvas: document.querySelector('.basics05 canvas'),
          register: id => { requestAnimationFrameId = id },
          uniforms
        }) }
        onComponentWillUnmount={ () => cancelAnimationFrame(requestAnimationFrameId) }
        onComponentShouldUpdate={ utils.shouldUpdate } />
    </div>
  )
}

export default ({ children }, { store }) => {
  const subscribe = callback => {
    store.select(sq('ex5.scene.uniforms')).on('update', ({ data }) => callback(data.currentData))
  }
  return (
    <Basics05
      subscribe={ subscribe }
      uniforms={ store.get(sq('ex5.scene.uniforms')) }
      onComponentShouldUpdate={ utils.shouldUpdate }
    />
  )
}
