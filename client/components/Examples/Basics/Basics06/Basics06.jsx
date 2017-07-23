import Inferno from 'inferno'
import twgl from 'twgl.js'
import _ from 'lodash'

import { default as utils, sq } from '-/utils'
import Example from '-Example'

import notes from './readme.md'
import './Basics06.scss'
import vtxShader from './vertex.glsl'
import fragShader from './fragment.glsl'
import cube from '../cube'
import stainedGlassTexture from './stained-glass.png'
import companionCubeTexture from './companion.png'
import marioCubeTexture from './mario.png'
import stoneTileTexture from './stone-tile.jpg'
import carbonFiberTexture from './carbon-fiber.jpg'
import amberGlassTexture from './amber-glass.jpg'
import infinityTexture from './infinity.jpg'

const initGL = (canvas, config) => {
  const gl = canvas.getContext('webgl2')
  const programInfo = twgl.createProgramInfo(gl, [
    vtxShader,
    fragShader
  ])

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, cube)

  return {
    gl,
    programInfo,
    bufferInfo
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

const didMount = ({ canvas, register, uniforms, texture }) => {
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
    time => { worldRotationY += time * .001 }
  ])

  const render = time => {
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

const Canvas = ({ id }) => {
  return <canvas id={ id }/>
}

const Basics0601 = ({ color, id, texture, alpha }, { store }) => {
  const uniforms = store.get(sq('ex5.scene.uniforms'))
  let requestAnimationFrameId
  return (
    <Canvas
      id={ id }
      onComponentWillUnmount={ () => cancelAnimationFrame(requestAnimationFrameId) }
      onComponentDidMount={ () => didMount({
        canvas: document.querySelector(`#${id}`),
        register: animId => { requestAnimationFrameId = animId },
        uniforms: _.merge({}, uniforms, { u_lightColor: color, u_alpha: alpha }),
        texture
      }) }
    />
  )
}

const Basics06 = ({ uniforms }) => {
  const components = {
    Basics0601: ({ color, id, texture, alpha }) => (
      <Basics0601 color={ color } id={ id } texture={ texture } alpha={ alpha }/>
    )
  }
  return (
    <div class='basics06'>
      <Example
        notes={ notes }
        components={ components }
        onComponentShouldUpdate={ utils.shouldUpdate } />
    </div>
  )
}

export default ({ children }, { store }) => {
  return (
    <Basics06 onComponentShouldUpdate={ utils.shouldUpdate }/>
  )
}
