import React from 'react'
import * as THREE from 'three'
import Stats from 'stats.js'
import threeOrbitControls from 'three-orbit-controls'
import { css } from 'emotion'

import Example from '-/components/example'
import { onResize } from '-/utils'
import notes from './readme.md'
import {
  createTextures,
  fillTextures,
  createRenderTarget,
  createSceneAndCamera,
  createParticles,
} from './particles'
import {
  vs,
  updatePos,
  updateVel,
  updateF,
  updateDensity,
  updatePressure,
} from './shaders'

const WIDTH = 100
const HEIGHT = 100
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

const init = ({ canvas, container }) => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const stats = new Stats()
  stats.showPanel(0)
  document.body.appendChild(stats.dom)

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    2000
  )
  camera.updateProjectionMatrix()
  camera.position.set(0, 5, 10)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  if (!checkCapabilities(renderer)) {
    return
  }

  const ambientLight = new THREE.AmbientLight(0x707070)
  scene.add(ambientLight)
  const pointLight = new THREE.PointLight(0xffffff)
  pointLight.position.set(5, 5, 0)
  scene.add(pointLight)

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

  const dataTextures = createTextures({ width: WIDTH, height: HEIGHT })
  fillTextures(dataTextures)

  const rts = () => [
    createRenderTarget({ width: WIDTH, height: HEIGHT }),
    createRenderTarget({ width: WIDTH, height: HEIGHT }),
  ]
  const textures = {
    pos: rts(),
    vel: rts(),
    f: rts(),
    d: rts(),
    p: rts(),
  }
  const { scene: rtScene, camera: rtCamera } = createSceneAndCamera({
    w: WIDTH,
    h: HEIGHT,
  })

  // Set up particle uniforms, textures, etc.
  const uniforms = {
    u_position: { value: dataTextures.pos },
    u_last_position: { value: dataTextures.pos },
    u_velocity: { value: dataTextures.vel },
    u_force: { value: dataTextures.f },
    u_density_pressure: { value: dataTextures.dp },
    u_resolution: { value: new THREE.Vector2(WIDTH, WIDTH) },
    u_time: { type: 'f', value: 0 },
    u_delta: { type: 'f', value: 0 },
  }

  const mat = (fs) =>
    new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms,
    })
  const materials = {
    pos: mat(updatePos),
    vel: mat(updateVel),
    f: mat(updateF),
    d: mat(updateDensity),
    p: mat(updatePressure),
  }

  const geometry = new THREE.PlaneBufferGeometry(WIDTH, HEIGHT)
  const object = new THREE.Mesh(geometry, materials.pos)
  rtScene.add(object)

  // Add the actual particles instance to the scene
  const particles = createParticles(PARTICLES, WIDTH, uniforms)
  scene.add(particles)

  const compute = (ukey, texkey, matkey) => {
    // Compute/render
    object.material = materials[matkey]
    renderer.setRenderTarget(textures[texkey][1])
    renderer.render(rtScene, rtCamera)
    // Swap textures
    const temp = textures[texkey][0]
    textures[texkey][0] = textures[texkey][1]
    uniforms[ukey].value = textures[texkey][0].texture
    textures[texkey][1] = temp
  }

  const clock = new THREE.Clock()
  const animate = () => {
    if (renderer) {
      stats.begin()
      requestAnimationFrame(animate)

      compute('u_density_pressure', 'd', 'd')
      // compute('u_density_pressure', 'p', 'p')
      compute('u_force', 'f', 'f')
      // const temp = textures.pos[0].texture.clone()
      compute('u_position', 'pos', 'pos')
      // uniforms.u_last_position.value = temp
      compute('u_velocity', 'vel', 'vel')

      // Render the scene
      renderer.setRenderTarget(null)
      renderer.render(scene, camera)

      // Update the clock
      uniforms.u_delta.value = clock.getDelta() / 1.5
      uniforms.u_time.value = clock.elapsedTime / 1.5

      // camera.position.set(
      //   Math.sin(uniforms.u_time.value / 3) * 7,
      //   3,
      //   Math.cos(uniforms.u_time.value / 3) * 7
      // )
      // camera.lookAt(0, 0, 0)

      stats.end()
    }
  }
  animate()

  return () => {
    renderer.dispose()
    stats.scene = null
    document.body.removeChild(stats.dom)
    renderer = null
  }
}

const style = css`
  canvas {
    position: fixed;
    top: 68px;
    left: 0px;
    width: 100vw;
    height: calc(100vh - 68px) !important;
    background-color: black;
  }
`

const E = () => (
  <div className={style}>
    <Example notes={notes} init={init} />
  </div>
)

export default E
