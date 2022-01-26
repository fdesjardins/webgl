import * as THREE from 'three'
import Stats from 'stats.js'
import threeOrbitControls from 'three-orbit-controls'

import {
  createTextures,
  fillTextures,
  createRenderTarget,
  createSceneAndCamera,
  createParticles,
} from './particles'
import { vs, updatePos, updateVel } from './shaders'
import { onResize } from '../../utils'

const WIDTH = 300
const HEIGHT = 300
const PARTICLES = WIDTH * WIDTH

const checkCapabilities = (renderer) => {
  if (
    renderer.capabilities.isWebGL2 === false &&
    renderer.extensions.has('OES_texture_float') === false
  ) {
    console.error('No OES_texture_float support for float textures.')
    return 0
  }
  if (renderer.capabilities.maxVertexTextures === 0) {
    console.error('No support for vertex shader textures')
    return 0
  }
  return 1
}

export const init = ({ canvas, container }) => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const stats = new Stats()
  stats.showPanel(0)
  container.appendChild(stats.dom)
  stats.dom.className = 'stats'

  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.1, 2000)
  camera.updateProjectionMatrix()
  camera.position.set(3, 3, 3)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  if (!checkCapabilities(renderer)) {
    return
  }

  canvas.addEventListener(
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

  const dataTextures = createTextures({ width: WIDTH, height: HEIGHT })
  fillTextures(dataTextures.position, dataTextures.velocity)
  let currentPosTexture = createRenderTarget({ width: WIDTH, height: HEIGHT })
  let nextPosTexture = createRenderTarget({ width: WIDTH, height: HEIGHT })
  let currentVelTexture = createRenderTarget({ width: WIDTH, height: HEIGHT })
  let nextVelTexture = createRenderTarget({ width: WIDTH, height: HEIGHT })
  const { scene: rtScene, camera: rtCamera } = createSceneAndCamera({
    w: WIDTH,
    h: HEIGHT,
  })

  // Set up particle uniforms, textures, etc.
  const uniforms = {
    u_position: { value: dataTextures.position },
    u_velocity: { value: dataTextures.velocity },
    u_resolution: { value: new THREE.Vector2(WIDTH, WIDTH) },
    u_time: { type: 'f', value: 0 },
    u_delta: { type: 'f', value: 0 },
  }
  const posMaterial = new THREE.ShaderMaterial({
    vertexShader: vs,
    fragmentShader: updatePos,
    uniforms,
  })
  const velMaterial = new THREE.ShaderMaterial({
    vertexShader: vs,
    fragmentShader: updateVel,
    uniforms,
  })
  const geometry = new THREE.PlaneBufferGeometry(WIDTH, HEIGHT)
  const object = new THREE.Mesh(geometry, posMaterial)
  rtScene.add(object)

  // Add the actual particles instance to the scene
  const particles = createParticles(PARTICLES, WIDTH, uniforms)
  scene.add(particles)

  const clock = new THREE.Clock()
  const animate = () => {
    if (renderer) {
      stats.begin()
      requestAnimationFrame(animate)

      // Update positions
      object.material = posMaterial
      renderer.setRenderTarget(nextPosTexture)
      renderer.render(rtScene, rtCamera)

      // Swap position textures
      let temp = currentPosTexture
      currentPosTexture = nextPosTexture
      uniforms.u_position.value = currentPosTexture.texture
      nextPosTexture = temp

      // Update velocities
      object.material = velMaterial
      renderer.setRenderTarget(nextVelTexture)
      renderer.render(rtScene, rtCamera)

      // Swap velocity textures
      temp = currentVelTexture
      currentVelTexture = nextVelTexture
      uniforms.u_velocity.value = currentVelTexture.texture
      nextVelTexture = temp

      // Render the scene
      renderer.setRenderTarget(null)
      renderer.render(scene, camera)

      // Update the clock
      uniforms.u_delta.value = clock.getDelta()
      uniforms.u_time.value = clock.elapsedTime

      stats.end()
    }
  }
  animate()

  return () => {
    renderer.dispose()
    stats.scene = null
    container.removeChild(stats.dom)
    renderer = null
    controls.dispose()
  }
}
