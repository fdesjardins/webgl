import React from 'react'
import PT from 'prop-types'
import * as twgl from 'twgl.js'
import * as OBJ from 'webgl-obj-loader'
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
import teapot from './assets/teapot.json'
import sw45 from './assets/sw45.obj'
import sw45tex from './assets/sw45tex.png'

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
  const gl = canvas.getContext('webgl2')
  const programInfo = twgl.createProgramInfo(gl, [vtxShader, fragShader])

  const cubeBufferInfo = twgl.createBufferInfoFromArrays(gl, cube)

  const teapotBufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: teapot.vertexPositions,
    normal: teapot.vertexNormals,
    texcoord: teapot.vertexTextureCoords,
    indices: teapot.indices
  })

  const sw45Mesh = new OBJ.Mesh(sw45)
  const sw45BufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: sw45Mesh.vertices,
    normal: sw45Mesh.vertexNormals,
    texcoord: sw45Mesh.textures,
    indices: sw45Mesh.indices
  })

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
    },
    sw45: {
      src: sw45tex,
      mag: gl.NEAREST,
      min: gl.LINEAR
    }
  })

  return {
    gl,
    programInfo,
    bufferInfo: {
      cube: cubeBufferInfo,
      teapot: teapotBufferInfo,
      sw45: sw45BufferInfo
    },
    textures
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

const init = ({ canvas, uniforms, texture, model }) => {
  const { gl, programInfo, bufferInfo, textures } = initGL(canvas)
  const m4 = twgl.m4

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
    uniforms = _.merge({}, uniforms, { u_diffuse: textures[texture] })

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const fov = (30 * Math.PI) / 180
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.5
    const zFar = 200
    const projection = m4.perspective(fov, aspect, zNear, zFar)
    const eye = [1, 30, 32]
    const target = [0, 0, 0]
    const up = [0, 2, 1]
    const camera = m4.lookAt(eye, target, up)
    const view = m4.inverse(camera)
    const viewProjection = m4.multiply(projection, view)
    const world = m4.rotationY(worldRotationY)

    uniforms.u_viewInverse = camera
    uniforms.u_world = world
    uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world))
    uniforms.u_worldViewProjection = m4.multiply(viewProjection, world)

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo[model])
    twgl.setUniforms(programInfo, uniforms)
    gl.drawElements(gl.TRIANGLES, bufferInfo[model].numElements, gl.UNSIGNED_SHORT, 0)

    animate()
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

const Obj = ({ color, model, texture, alpha }) => {
  const canvas = React.useRef(null)
  React.useEffect(() => {
    return init({
      canvas: canvas.current,
      uniforms: _.merge({}, globals.uniforms, { u_lightColor: color, u_alpha: alpha }),
      model,
      texture
    })
  })
  return <canvas ref={canvas} />
}
Obj.propTypes = {
  color: PT.array,
  model: PT.string,
  texture: PT.string,
  alpha: PT.number
}

const Default = () => (
  <Example notes={notes} components={{ Obj }} init={() => () => {}}/>
)

export default Default
