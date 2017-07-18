import Inferno from 'inferno'
import { default as utils, sq } from '-/utils'
import * as THREE from 'three'

import Example from '-Example'
import './Threejs03.scss'
import notes from './readme.md'

const didMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientWidth, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ canvas })

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry1 = new THREE.IcosahedronBufferGeometry(1,2)
  const material1 = new THREE.MeshPhongMaterial({ color: 0xFF6666 })
  const polyhedron1 = new THREE.Mesh(geometry1, material1)
  polyhedron1.position.set(-2,0,0)
  const geometry2 = new THREE.IcosahedronBufferGeometry(1,2)
  const material2 = new THREE.MeshPhongMaterial({ color: 0x6666FF })
  const polyhedron2 = new THREE.Mesh(geometry2, material2)
  polyhedron2.position.set(2,0,0)

  const light = new THREE.PointLight( 0xffffff, 1, 100)
  light.position.set(0,3,0)
  scene.add(light)
  scene.add(polyhedron1)
  scene.add(polyhedron2)

  const animate = () => {
    requestAnimationFrame(animate)

    // cube.rotation.x += 0.01
    // cube.rotation.y += 0.01

    renderer.render(scene, camera)
  }
  animate()
}
export default ({ children }, { store }) => (
  <div id="threejs03">
    <Example
      notes={ notes }
      onComponentShouldUpdate={ utils.shouldUpdate }
      onComponentDidMount={ () => didMount({
        canvas: document.querySelector('#threejs03 canvas'),
        container: document.querySelector('#threejs03')
      }) }
    />
  </div>
)
