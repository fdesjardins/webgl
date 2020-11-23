import React from 'react'
import PT from 'prop-types'
import * as twgl from 'twgl.js'
import _ from 'lodash'

import Example from '-/components/example'
import notes from './readme.md'

import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'
import cube from '-/assets/cube'
import stainedGlassTexture from './assets/stained-glass.png'
import companionCubeTexture from './assets/companion.png'
import marioCubeTexture from './assets/mario.png'
import stoneTileTexture from './assets/stone-tile.jpg'
import carbonFiberTexture from './assets/carbon-fiber.jpg'
import amberGlassTexture from './assets/amber-glass.jpg'
import infinityTexture from './assets/infinity.jpg'

const globals = {
  uniforms: {
    u_lightWorldPos: [10, 10, -10],
    u_lightColor: [1, 1, 1, 1],
    u_ambient: [0.2, 0.2, 0.2, 1],
    u_specular: [0.8, 0.8, 0.8, 1],
    u_shininess: 100,
    u_specularFactor: 10,
    u_diffuse: null,
    u_alpha: 0.7
  }
}

const initGL = (canvas, config) => {
  const gl = canvas.getContext('webgl')

  const programInfo = twgl.createProgramInfo(gl, [vtxShader, fragShader])

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, cube)

  return {
    gl,
    programInfo,
    bufferInfo
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

const init = ({ canvas, register, uniforms, texture }) => {
  const { gl, programInfo, bufferInfo } = initGL(canvas)
  const m4 = twgl.m4

  const textures = twgl.createTextures(gl, {
    stainedGlass: {
      src: stainedGlassTexture,
      mag: gl.LINEAR,
      min: gl.LINEAR_MIPMAP_NEAREST
    },
    companion: {
      src: companionCubeTexture,
      mag: gl.NEAREST,
      min: gl.LINEAR
    },
    mario: {
      src: marioCubeTexture,
      mag: gl.NEAREST,
      min: gl.LINEAR
    },
    stone: {
      src: stoneTileTexture,
      mag: gl.NEAREST,
      min: gl.LINEAR
    },
    carbonFiber: {
      src: carbonFiberTexture,
      mag: gl.NEAREST,
      min: gl.LINEAR
    },
    amberGlass: {
      src: amberGlassTexture,
      mag: gl.NEAREST,
      min: gl.LINEAR
    },
    infinity: {
      src: infinityTexture,
      mag: gl.NEAREST,
      min: gl.LINEAR
    }
  })

  uniforms = _.merge({}, uniforms)
  uniforms.u_diffuse = textures[texture]

  let worldRotationY = 0
  const animate = animateScene([
    (time) => {
      worldRotationY += time * 0.001
    }
  ])

  const render = (time) => {
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    if (uniforms.u_alpha < 1) {
      gl.disable(gl.DEPTH_TEST)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    } else {
      gl.enable(gl.DEPTH_TEST)
    }

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
  requestAnimationFrame(render)
}

const Tex = ({ color, model, texture, alpha }) => {
  const canvas = React.useRef(null)
  React.useEffect(() => {
    return init({
      canvas: canvas.current,
      uniforms: { ...globals.uniforms, u_lightColor: color, u_alpha: alpha },
      model,
      texture
    })
  })
  return <canvas ref={canvas} />
}
Tex.propTypes = {
  color: PT.array,
  model: PT.string,
  texture: PT.string,
  alpha: PT.number
}

const Default = () => (
  <Example notes={notes} components={{ Tex }} init={() => () => {}}/>
)

export default Default
