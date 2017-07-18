import Inferno from 'inferno'
import { default as utils, sq } from '-/utils'
import * as THREE from 'three'

import Example from '-Example'
import './Threejs01.scss'
import notes from './readme.md'

const didMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientWidth, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ canvas })

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const animate = () => {
    requestAnimationFrame(animate)

    cube.rotation.x += 0.1
    cube.rotation.y += 0.1

    renderer.render(scene, camera)
  }
  animate()
}

const Threejs01 = ({ subscribe }) => {
  const components = { Canvas: () => <canvas/> }
  return (
    <div id="threejs01">
      <Example
        notes={ notes }
        components={ components }
        onComponentDidMount={ () => didMount({
          canvas: document.querySelector('#threejs01 canvas'),
          container: document.querySelector('#threejs01')
        }) }
      />
    </div>
  )
}

export default ({ children }, { store }) => {
  const subscribe = callback => {
    store.select(sq('Threejs01.scene')).on('update', ({ data }) => callback(data.currentData))
  }
  return (
    <Threejs01
      subscribe={ subscribe }
      onComponentShouldUpdate={ utils.shouldUpdate }
    />
  )
}
