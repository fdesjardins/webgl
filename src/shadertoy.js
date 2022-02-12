import * as THREE from 'three'
import Stats from 'stats.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { onResize } from './utils'

// const fpsControls = (camera, domElement) => {
//   const controls = new FirstPersonControls(camera, domElement)
//   controls.lookSpeed = 0.1
//   controls.movementSpeed = 4
//   controls.noFly = true
//   controls.lookVertical = true
//   controls.constrainVertical = true
//   controls.verticalMin = 1.0
//   controls.verticalMax = 2.0
//   controls.lon = -150
//   controls.lat = 120
//   controls.update()
//   return controls
// }

// const flyControls = (camera, domElement) => {
//   const controls = new FlyControls(camera, domElement)
//   controls.movementSpeed = 10
//   controls.domElement = domElement
//   controls.rollSpeed = Math.PI / 24
//   controls.autoForward = false
//   return controls
// }

const createUniforms = (canvas) => {
  return {
    iResolution: {
      type: 'vec2',
      value: new THREE.Vector2(canvas.width, canvas.height),
    },
    iTime: {
      type: 'f',
      value: 0.001,
    },
    // iTimeDelta,
    // iFrame,
    iCameraPosition: {
      type: 'vec3',
      value: new THREE.Vector3(4, 10, 16),
    },
    iCameraDirection: {
      type: 'vec3',
      value: new THREE.Vector3(),
    },
  }
}

export const shadertoyInit = ({ canvas, container, vs, fs }) => {
  console.log('shadertoy init')
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const stats = new Stats()
  stats.showPanel(0)
  container.appendChild(stats.dom)
  stats.dom.className = 'stats'

  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.1, 2000)
  camera.updateProjectionMatrix()
  camera.position.set(4, 10, 16)
  camera.lookAt(0, 0, 0)

  let renderer = new THREE.WebGLRenderer({
    canvas,
    antiAlias: true,
    powerPreference: 'high-performance',
    stencil: false,
    // depth: false,
  })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.update()

  const uniforms = createUniforms(canvas)
  const geometry = new THREE.PlaneBufferGeometry(40, 40, 2, 2)
  const material = new THREE.ShaderMaterial({
    fragmentShader: fs,
    vertexShader: vs,
    uniforms,
  })
  const object = new THREE.Mesh(geometry, material)
  scene.add(object)

  const handleResize = (event) => {
    event.preventDefault()
    onResize({ canvas, camera, renderer })
    uniforms.iResolution.value = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight)
  }
  window.addEventListener('resize', handleResize, false)
  onResize({ canvas, camera, renderer })

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 3, 5)
  scene.add(light)

  const camDirection = new THREE.Vector3()

  const clock = new THREE.Clock()
  const animate = () => {
    if (renderer) {
      stats.begin()
      const delta = clock.getDelta()

      camera.getWorldDirection(camDirection)
      camDirection.normalize()
      object.position.copy(camera.position.clone().add(camDirection.multiplyScalar(13)))
      object.lookAt(camera.position.clone())

      uniforms.iTime.value += delta
      uniforms.iCameraPosition.value.copy(camera.position)
      uniforms.iCameraDirection.value.copy(camDirection)

      if (renderer) {
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }
      stats.end()
    }
  }
  animate()

  return {
    scene,
    camera,
    dispose: () => {
      renderer.dispose()
      stats.scene = null
      container.removeChild(stats.dom)
      renderer = null
      window.removeEventListener('resize', handleResize)
      controls.dispose()
    },
  }
}
