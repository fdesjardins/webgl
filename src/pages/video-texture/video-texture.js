import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const setupVideo = () => {
  const url = 'https://storage.googleapis.com/avcp-camera-images/447B.mp4'

  const video = document.createElement('video')
  video.autoplay = true
  video.muted = true
  video.loop = true
  video.crossOrigin = 'anonymous'
  video.src = url
  video.load()
  video.play()

  return video
}

export const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 20.0

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.update()

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

  const light = new THREE.AmbientLight(0xffffff)
  scene.add(light)

  const video = setupVideo()
  const videoTexture = new THREE.VideoTexture(video)
  videoTexture.format = THREE.RGBFormat
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.magFilter = THREE.LinearFilter
  videoTexture.needsUpdate = true

  const geometry = new THREE.SphereBufferGeometry(10, 32, 32)
  const material = new THREE.MeshPhongMaterial({
    map: videoTexture,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide,
  })
  material.map.minFilter = THREE.LinearFilter
  material.map.maxFilter = THREE.LinearFilter

  const object = new THREE.Mesh(geometry, material)
  object.matrixAutoUpdate = true
  scene.add(object)

  const animate = () => {
    if (!renderer) {
      return
    }
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  return () => {
    renderer.dispose()
    controls.dispose()
    scene = null
    renderer = null
    window.removeEventListener('resize', handleResize)
  }
}
