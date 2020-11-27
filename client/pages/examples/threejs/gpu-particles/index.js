import React from 'react'
// import PT from 'prop-types'
import * as THREE from 'three'
import Stats from 'stats.js'
import threeOrbitControls from 'three-orbit-controls'

import Example from '-/components/example'
import { onResize } from '-/utils'
import notes from './readme.md'
import { initParticles } from './particles'
import { vs, fs } from './shaders'

const BLACK = 0x000000

const WIDTH = 64
const HEIGHT = 64

const state = {
  numParticles: 0,
  maxParticles: 500,
  gravityGs: 1,
  particleLifeSec: 5,
}

const rtScene = () => {
  const renderTarget = new THREE.WebGLRenderTarget(WIDTH, HEIGHT, {
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  })
  // const camera = new THREE.PerspectiveCamera(75, width / height, 0.001, 1000)
  const camera = new THREE.OrthographicCamera(
    -WIDTH / 2,
    HEIGHT / 2,
    WIDTH / 2,
    -HEIGHT / 2,
    0.1,
    10
  )
  camera.position.z = 1
  camera.updateProjectionMatrix()
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffff00)
  const ambientLight = new THREE.AmbientLight(0xffffff)
  scene.add(ambientLight)

  return {
    renderTarget,
    scene,
    camera,
  }
}

const init = ({ canvas, container }) => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const stats = new Stats()
  stats.showPanel(0)
  canvas.appendChild(stats.dom)

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    2000
  )
  camera.updateProjectionMatrix()
  camera.position.z = 50

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  window.addEventListener(
    'resize',
    (event) => {
      event.preventDefault()
      onResize({ canvas, camera, renderer })
    },
    false
  )

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera)
  controls.update()

  const light = new THREE.PointLight(0x00ff00, 2, 100)
  light.position.set(0, 20, 30)
  light.castShadow = true
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 500
  scene.add(light)

  const dataTextures = initParticles({ width: WIDTH, height: HEIGHT })
  const textureOptions = {
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  }
  let currentTexture = new THREE.WebGLRenderTarget(
    WIDTH,
    HEIGHT,
    textureOptions
  )
  let nextTexture = new THREE.WebGLRenderTarget(WIDTH, HEIGHT, textureOptions)

  const {
    renderTarget,
    scene: renderTargetScene,
    camera: renderTargetCamera,
  } = rtScene()

  const geometry = new THREE.PlaneBufferGeometry(WIDTH, HEIGHT)

  const uniforms = {
    u_texture: { type: 't', value: dataTextures.position },
  }

  const iTime = {
    type: 'f',
    value: 1.5 * Math.PI,
  }
  const material = new THREE.ShaderMaterial({
    vertexShader: vs,
    fragmentShader: fs,
    side: THREE.DoubleSide,
    uniforms,
  })
  const object = new THREE.Mesh(geometry, material)

  renderTargetScene.add(object)

  // const sphere = new THREE.SphereBufferGeometry(256, 32, 32)
  const targetMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(WIDTH, HEIGHT),
    material
  )
  scene.add(targetMesh)

  let counter = 1

  const animate = () => {
    if (renderer) {
      stats.begin()
      requestAnimationFrame(animate)

      renderer.setRenderTarget(nextTexture)
      renderer.render(renderTargetScene, renderTargetCamera)

      if (counter++ % 1 === 0) {
        const temp = currentTexture
        currentTexture = nextTexture
        uniforms.u_texture.value = currentTexture.texture
        nextTexture = temp
      }

      renderer.setRenderTarget(null)
      renderer.render(scene, camera)

      stats.end()
    }
  }
  animate()

  return () => {
    renderer.dispose()
    stats.scene = null
    renderer = null
  }
}

const E = () => <Example notes={notes} init={init} />

export default E
