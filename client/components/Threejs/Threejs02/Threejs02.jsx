import Inferno from 'inferno'
import { default as utils, sq } from '-/utils'
import * as THREE from 'three'

import './Threejs02.scss'

const didMount = (subscribe) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)//new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#threejs') })
  //renderer.setSize(400, 400)
  renderer.setSize(window.innerWidth, window.innerHeight)
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

const Threejs = () => {
  return (
    <canvas id='threejs'></canvas>
  )
}

const Threejs02 = ({ subscribe }) => {
  return (
    <div id="threejs01">
      <Threejs
        onComponentDidMount={ () => didMount(subscribe) }
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
