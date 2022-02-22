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

const defaultVs = `
varying vec2 texCoord;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
  texCoord = vec2(gl_Position.x, gl_Position.y);
}`

const loader = new THREE.TextureLoader()

const createUniforms = (canvas, iChannel0) => {
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
      value: new THREE.Vector3(),
    },
    iCameraDirection: {
      type: 'vec3',
      value: new THREE.Vector3(),
    },
    iChannel0: {
      value: loader.load(iChannel0),
    },
    iCameraFov: {
      type: 'f',
      value: 2.0,
    },
  }
}

export const shadertoyInit = ({ canvas, container, vs, fs, iChannel0 }) => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const stats = new Stats()
  stats.showPanel(0)
  container.appendChild(stats.dom)
  stats.dom.className = 'stats'

  const camera = new THREE.PerspectiveCamera(
    90,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    2000
  )
  camera.updateProjectionMatrix()
  camera.position.set(-17, 0, 0)
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

  const uniforms = createUniforms(canvas, iChannel0)
  const geometry = new THREE.PlaneBufferGeometry(40, 40, 2, 2)
  const material = new THREE.ShaderMaterial({
    fragmentShader: fs,
    vertexShader: vs || defaultVs,
    uniforms,
  })
  const object = new THREE.Mesh(geometry, material)
  scene.add(object)

  // const box = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), new THREE.MeshBasicMaterial())
  // scene.add(box)

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

  const oldConsoleError = console.error
  console.error = (error) => {
    if (error.match('Shader Error')) {
      renderer.dispose()
      renderer = null
      const err = new Error()
      err.name = 'Shader Error'
      err.message = error.split('\n').filter((line) => line.match('Program Info Log'))[0]
      err.stack = error
      // .split('\n')
      // .filter((line) => parseInt(line.split(':')[0]))
      // .join('\n')
      throw err
    }
    oldConsoleError(error)
  }

  const clock = new THREE.Clock()
  const animate = () => {
    if (!renderer) {
      return
    }
    requestAnimationFrame(animate)

    stats.begin()
    const delta = clock.getDelta()
    controls.update(delta)

    camera.getWorldDirection(camDirection)
    camDirection.normalize()
    object.position.copy(camera.position.clone().add(camDirection.multiplyScalar(13)))
    object.lookAt(camera.position.clone())

    uniforms.iTime.value += delta
    uniforms.iCameraPosition.value.copy(camera.position)
    uniforms.iCameraDirection.value.copy(camDirection)

    renderer.render(scene, camera)

    stats.end()
  }
  animate()

  return {
    scene,
    camera,
    controls,
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
