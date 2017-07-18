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

const Threejs03 = ({ subscribe }) => {
  const components = { Canvas: () => <canvas/> }
  return (
    <div id="Threejs03">
      <Example
        notes={ notes }
        components={ components }
        onComponentDidMount={ () => didMount({
          canvas: document.querySelector('#Threejs03 canvas'),
          container: document.querySelector('#Threejs03')
        }) }
      />
    </div>
  )
}

export default ({ children }, { store }) => {
  const subscribe = callback => {
    store.select(sq('Threejs03.scene')).on('update', ({ data }) => callback(data.currentData))
  }
  return (
    <Threejs03
      subscribe={ subscribe }
      onComponentShouldUpdate={ utils.shouldUpdate }
    />
  )
}
