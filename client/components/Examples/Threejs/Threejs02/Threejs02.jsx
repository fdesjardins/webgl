import Inferno from 'inferno'
import { default as utils, sq } from '-/utils'
import * as THREE from 'three'

import Example from '-Example'
import './Threejs02.scss'
import notes from './readme.md'

const didMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientWidth, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ canvas })

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshLambertMaterial({ color: 0x666666 })
  const cube = new THREE.Mesh(geometry, material)
  const light = new THREE.PointLight( 0xffffff, 1, 100)
  light.position.set(1,4,2)
  scene.add(light)
  scene.add(cube)

  const animate = () => {
    requestAnimationFrame(animate)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderer.render(scene, camera)
  }
  animate()
}

const Threejs02 = ({ subscribe }) => {
  const components = { Canvas: () => <canvas/> }
  return (
    <div id="threejs02">
      <Example
        notes={ notes }
        components={ components }
        onComponentDidMount={ () => didMount({
          canvas: document.querySelector('#threejs02 canvas'),
          container: document.querySelector('#threejs02')
        }) }
      />
    </div>
  )
}

export default ({ children }, { store }) => {
  const subscribe = callback => {
    store.select(sq('Threejs02.scene')).on('update', ({ data }) => callback(data.currentData))
  }
  return (
    <Threejs02
      subscribe={ subscribe }
      onComponentShouldUpdate={ utils.shouldUpdate }
    />
  )
}
