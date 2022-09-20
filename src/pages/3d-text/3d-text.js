import * as THREE from 'three'
import Stats from 'stats.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json'
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

  const font = new Font(helvetiker)
  //  fontloader.load( helvetiker, function ( font ) {

    const textgeometry = new TextGeometry( '3d text', {
      font: font,
      size: 1,
      height: .2,
      curveSegments: 12,
      bevelEnabled: false
    } );
    const textmaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
    const text = new THREE.Mesh(textgeometry, textmaterial)
    text.position.set(-5,0,0)
    text.rotateY(.78)
    //secretText.rotateX(1.57)
    //secretText.castShadow=true;
    text.traverse( function( node ) {
        if ( node.isMesh ) { node.castShadow = true; }
    } );
    scene.add(text)

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
    text.rotateX(clock.getDelta() * 0.5)
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
