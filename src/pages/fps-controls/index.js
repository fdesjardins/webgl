import * as THREE from 'three'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'

export const meta = {
  tags: 'threejs',
  title: 'FPS Controls',
  slug: 'first-person-controls',
}

export const options = {
  display: 'fullscreen',
}

export const init = ({ canvas, container }) => {
  let renderer = new THREE.WebGLRenderer({ canvas })
  let scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )
  camera.position.z = 10
  camera.position.y = 5

  const handleResize = (event) => {
    if (event) {
      event.preventDefault()
    }
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  }
  window.addEventListener('resize', handleResize, false)
  handleResize()

  const clock = new THREE.Clock()

  const size = 50
  const divisions = 50
  const gridHelper = new THREE.GridHelper(size, divisions)
  gridHelper.position.x = 0
  gridHelper.position.y = 0
  gridHelper.position.z = 0
  scene.add(gridHelper)

  renderer.setSize(container.clientWidth, container.clientWidth)

  const light = new THREE.PointLight(0xffffff, 2, 100)
  light.position.set(0, 1, -3)
  scene.add(light)

  const camControls = new FirstPersonControls(camera, canvas)
  camControls.lookSpeed = 0.4
  camControls.movementSpeed = 4
  camControls.noFly = true
  camControls.lookVertical = true
  camControls.constrainVertical = true
  camControls.verticalMin = 1.0
  camControls.verticalMax = 2.0
  camControls.lon = -150
  camControls.lat = 120

  const animate = () => {
    if (!renderer) {
      return
    }
    requestAnimationFrame(animate)
    camControls.update(clock.getDelta())
    renderer.render(scene, camera)
  }
  animate()

  return () => {
    renderer.dispose()
    scene = null
    renderer = null
    window.removeEventListener('resize', handleResize)
  }
}
