import * as THREE from 'three'
import Stats from 'stats.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { onResize } from '../../utils'

export const init = ({ canvas, container }) => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const stats = new Stats()
  stats.showPanel(0)
  container.appendChild(stats.dom)
  stats.dom.className = 'stats'

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    2000
  )
  camera.updateProjectionMatrix()
  camera.position.set(2, 1, 2)

  const controls = new OrbitControls(camera, canvas)
  controls.update()

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  const handleResize = (event) => {
    event.preventDefault()
    onResize({ canvas, camera, renderer })
  }
  window.addEventListener('resize', handleResize, false)
  onResize({ canvas, camera, renderer })

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshLambertMaterial({ color: 0xaaff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 3, 5)
  scene.add(light)

  const clock = new THREE.Clock()
  const animate = () => {
    if (!renderer) {
      return
    }
    stats.begin()
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    cube.rotateY(clock.getDelta() * 0.5)
    stats.end()
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
