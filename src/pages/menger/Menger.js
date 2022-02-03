import * as THREE from 'three'
import Stats from 'stats.js'
import threeOrbitControls from 'three-orbit-controls'

import { onResize } from '../../utils'
import { vs, fs } from './shaders'

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
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const stats = new Stats()
  stats.showPanel(0)
  container.appendChild(stats.dom)
  stats.dom.className = 'stats'

  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.1, 2000)
  camera.updateProjectionMatrix()
  camera.position.set(3, 3, 3)

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera)
  controls.update()

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

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

      requestAnimationFrame(animate)
      uniforms.iTime.value += delta
      renderer.render(scene, camera)
      stats.end()
    }
  }
  animate()

  return () => {
    renderer.dispose()
    stats.scene = null
    container.removeChild(stats.dom)
    renderer = null
    window.removeEventListener('resize', handleResize)
    controls.dispose()
  }
}
