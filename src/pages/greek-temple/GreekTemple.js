import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats.js'

import { vs, fs } from './shaders'
import { onResize } from '../../utils'

export const vec3 = (x, y, z) => new THREE.Vector3(x, y, z)

const orbitControls = (camera, domElement) => {
  const controls = new OrbitControls(camera, domElement)
  controls.target = vec3(0.0, 0.0, 0.0)
  controls.rotateSpeed = 1.5
  return controls
}

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
    iTime: {
      type: 'f',
      value: 100.0,
    },
    iResolution: {
      type: 'vec2',
      value: new THREE.Vector2(canvas.width, canvas.height),
    },
    cameraPos: {
      type: 'vec3',
      value: new THREE.Vector3(4, 10, 16),
    },
    cameraDir: {
      type: 'vec3',
      value: new THREE.Vector3(),
    },
    // iChannel0: {
    //   type: 'sampler2D',
    //   value: rustyMetal,
    // },
  }
}

export const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()

  const stats = new Stats()
  stats.showPanel(0)
  canvas.appendChild(stats.dom)
  stats.dom.className = 'stats'

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  )
  camera.updateProjectionMatrix()
  camera.position.set(4, 10, 16)
  camera.lookAt(0, 0, 0)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  scene.background = new THREE.Color(0xffffff)
  // renderer.context.disable(renderer.context.DEPTH_TEST)

  const controls = orbitControls(camera, renderer.domElement)
  // const controls = flyControls(camera, renderer.domElement)
  controls.enableDamping = true

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

  scene.add(new THREE.GridHelper(100, 60, new THREE.Color(0x666666), new THREE.Color(0x222222)))
  const camDirection = new THREE.Vector3()

  const clock = new THREE.Clock()

  const animate = (now) => {
    stats.begin()
    const delta = clock.getDelta()
    controls.update(delta)

    camera.getWorldDirection(camDirection)
    camDirection.normalize()
    object.position.copy(camera.position.clone().add(camDirection.multiplyScalar(13)))
    object.lookAt(camera.position.clone())
    // object.rotation.set(camera.rotation)

    uniforms.iTime.value += delta
    uniforms.cameraPos.value.copy(camera.position)
    uniforms.cameraDir.value.copy(camDirection)

    if (renderer) {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    stats.end()
  }
  animate()

  return () => {
    renderer.dispose()
    scene = null
    renderer = null
    controls.dispose()
    window.removeEventListener('resize', handleResize)
  }
}
