import { GUI } from 'dat.gui'
import * as twgl from 'twgl.js'

import stoneTileTex from './assets/stone-tile.jpg'
import carbonFiberTex from './assets/carbon-fiber.jpg'
import vs from './vs.glsl'
import fs from './fs.glsl'
import teapot from './assets/teapot.json'

export const meta = {
  tags: 'basics,twgl',
  title: 'Loading Objects',
  slug: 'loading-objects',
}

export const options = {
  display: 'fullscreen',
}

const createGui = (setTexture, textures) => {
  const gui = new GUI()
  const textureFolder = gui.addFolder('Textures')
  textureFolder.open()

  const api = {
    texture: 'Stone Tile',
  }
  const settings = {
    textures: ['Stone Tile', 'Carbon Fiber'],
  }
  const texturesCtrl = textureFolder.add(api, 'texture').options(settings.textures)
  texturesCtrl.onChange(() => {
    if (api.texture === 'Stone Tile') {
      setTexture(textures.stone)
    } else {
      setTexture(textures.carbon)
    }
  })
  return gui
}

export const init = ({ canvas }) => {
  const gl = canvas.getContext('webgl2')
  const programInfo = twgl.createProgramInfo(gl, [vs, fs])

  const teapotBufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: teapot.vertexPositions,
    normal: teapot.vertexNormals,
    texcoord: teapot.vertexTextureCoords,
    indices: teapot.indices,
  })
  const textures = twgl.createTextures(gl, {
    stone: {
      src: stoneTileTex,
      mag: gl.NEAREST,
      min: gl.LINEAR,
    },
    carbon: {
      src: carbonFiberTex,
      mag: gl.NEAREST,
      min: gl.LINEAR,
    },
  })
  const uniforms = {
    u_lightWorldPos: [10, 10, -10],
    u_lightColor: [1, 1, 1, 1],
    u_ambient: [0.2, 0.2, 0.2, 1],
    u_specular: [0.8, 0.8, 0.8, 1],
    u_shininess: 100,
    u_specularFactor: 10,
    u_diffuse: textures.stone,
    u_alpha: 0.7,
  }

  const setTexture = (texture) => {
    uniforms.u_diffuse = texture
  }
  const gui = createGui(setTexture, textures)

  let worldRotationY = 0
  const fov = (50 * Math.PI) / 180

  gl.clearColor(0, 0, 0, 1)
  gl.enable(gl.DEPTH_TEST)

  const render = (time) => {
    requestAnimationFrame(render)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.5
    const zFar = 200
    const projection = twgl.m4.perspective(fov, aspect, zNear, zFar)
    const eye = [1, 30, 32]
    const target = [0, 0, 0]
    const up = [0, 2, 1]
    const camera = twgl.m4.lookAt(eye, target, up)
    const view = twgl.m4.inverse(camera)
    const viewProjection = twgl.m4.multiply(projection, view)
    const world = twgl.m4.rotationY(worldRotationY)

    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    uniforms.u_viewInverse = camera
    uniforms.u_world = world
    uniforms.u_worldInverseTranspose = twgl.m4.transpose(twgl.m4.inverse(world))
    uniforms.u_worldViewProjection = twgl.m4.multiply(viewProjection, world)

    worldRotationY = time * 0.001

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, teapotBufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    gl.drawElements(gl.TRIANGLES, teapotBufferInfo.numElements, gl.UNSIGNED_SHORT, 0)
  }
  render(0.01)

  return () => {
    gui.destroy()
  }
}
