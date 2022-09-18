import * as THREE from 'three'
import Stats from 'stats.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { onResize } from '../../utils'
import * as logo from './swcube2textured.gltf'

export const init = ({ canvas, container }) => {
  const scene = new THREE.Scene()
  let swlogo
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
  const loader = new GLTFLoader();

  loader.load( logo, function ( gltf ) {
    gltf.scene.name="swlogo"
    console.log(gltf)
    swlogo = gltf
    scene.add( gltf.scene );
  }, undefined, function ( error ) {
  	console.error( error );
  } );
  swlogo = scene.getObjectByName("swlogo")
  console.log(swlogo)
  const handleResize = (event) => {
    event.preventDefault()
    onResize({ canvas, camera, renderer })
  }
  window.addEventListener('resize', handleResize, false)
  onResize({ canvas, camera, renderer })

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(10, 10, -10)
  const light2 = new THREE.PointLight(0xff0000, 1, 100)
  light2.position.set(0, 0, 0)
  scene.add(light)
  scene.add(light2)

  const clock = new THREE.Clock()
  const animate = () => {
    if (!renderer) {
      return
    }
    stats.begin()
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    //loadedlogo.rotateY(clock.getDelta() * 0.5)
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
