import * as THREE from 'three'
import { drawVs, drawFs } from './shaders'

export const createTextures = ({ width, height }) => {
  const posData = new Float32Array(4 * width * height)
  const velData = new Float32Array(4 * width * height)
  const fData = new Float32Array(4 * width * height)
  const dpData = new Float32Array(4 * width * height)

  const pos = new THREE.DataTexture(posData, width, height, THREE.RGBAFormat, THREE.FloatType)
  const vel = new THREE.DataTexture(velData, width, height, THREE.RGBAFormat, THREE.FloatType)
  const f = new THREE.DataTexture(fData, width, height, THREE.RGBAFormat, THREE.FloatType)
  const dp = new THREE.DataTexture(dpData, width, height, THREE.RGBAFormat, THREE.FloatType)

  return {
    pos,
    vel,
    f,
    dp,
  }
}

export const fillTextures = ({ pos, vel, f, dp }) => {
  const posData = pos.image.data
  for (let i = 0; i < posData.length; i += 4) {
    posData[i] = (Math.random() - 0.5) * 8
    posData[i + 1] = (Math.random() - 0.5) * 2.5
    posData[i + 2] = (Math.random() - 0.5) * 2.5
    posData[i + 3] = 0
  }

  const velData = vel.image.data
  for (let i = 0; i < velData.length; i += 4) {
    velData[i] = Math.random() * 2.0 - 1.0
    velData[i + 1] = Math.random() * 2.0 - 1.0
    velData[i + 2] = Math.random() * 2.0 - 1.0
    velData[i + 3] = 0
  }

  const fData = f.image.data
  for (let i = 0; i < fData.length; i += 4) {
    f[i] = 0
    f[i + 1] = 0
    f[i + 2] = 0
    f[i + 3] = 0
  }

  const dpData = dp.image.data
  for (let i = 0; i < dpData.length; i += 4) {
    dp[i] = 0
    dp[i + 1] = 0
    dp[i + 2] = 0
    dp[i + 3] = 0
  }
}

export const createParticles = (count, width, uniforms) => {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const uvs = new Float32Array(count * 2)
  let p = 0
  for (let j = 0; j < width; j += 1) {
    for (let i = 0; i < width; i += 1) {
      uvs[p++] = i / (width - 1)
      uvs[p++] = j / (width - 1)
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: drawVs,
    fragmentShader: drawFs,
    transparent: true,
  })
  material.extensions.drawBuffers = true

  const particles = new THREE.Points(geometry, material)
  particles.matrixAutoUpdate = false
  particles.updateMatrix()

  return particles
}

export const createRenderTarget = ({ width, height }) => {
  const textureOptions = {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  }
  return new THREE.WebGLRenderTarget(width, height, textureOptions)
}

export const createSceneAndCamera = ({ w, h }) => {
  const camera = new THREE.OrthographicCamera(-w / 2, h / 2, w / 2, -h / 2, 0.1, 10)
  camera.position.z = 1
  camera.updateProjectionMatrix()
  const scene = new THREE.Scene()

  return {
    scene,
    camera,
  }
}
