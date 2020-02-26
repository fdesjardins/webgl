import React from 'react'
import * as twgl from 'twgl.js'
import _ from 'lodash'

import { shouldUpdate, sq } from '-/utils'
import Example from '-/components/example'
import notes from './readme.md'
// import './Basics05.scss'
import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'
import { default as cube, tex as cubeTex } from '-/assets/cube'

const initGL = (canvas, config) => {
  const gl = canvas.getContext('webgl')
  const programInfo = twgl.createProgramInfo(gl, [vtxShader, fragShader])

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, cube)

  const tex = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: cubeTex
  })

  console.log(twgl)

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
    time => {
      worldRotationY += time * 0.001
    }
  ])

  const render = time => {
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
    register(requestAnimationFrame(render))
  }
  register(requestAnimationFrame(render))
}

const Canvas = ({ id }) => {
  return <canvas id={id} />
}

const Basics0501 = ({ color, id }, { store }) => {
  const uniforms = store.get(sq('ex5.scene.uniforms'))
  let requestAnimationFrameId
  return (
    <Canvas
      id={id}
      onComponentWillUnmount={() =>
        cancelAnimationFrame(requestAnimationFrameId)
      }
      onComponentDidMount={() =>
        didMount({
          canvas: document.querySelector(`#${id}`),
          register: animId => {
            requestAnimationFrameId = animId
          },
          uniforms: _.merge({}, uniforms, { u_lightColor: color })
        })
      }
    />
  )
}

const Basics05 = ({ uniforms }) => {
  const components = {
    Basics0501: ({ color, id }) => <Basics0501 color={color} id={id} />
  }
  return (
    <div className="basics05">
      <Example
        notes={notes}
        components={components}
        onComponentShouldUpdate={shouldUpdate}
      />
    </div>
  )
}

export default ({ children }, { store }) => {
  return <Basics05 onComponentShouldUpdate={shouldUpdate} />
}
