import Inferno from 'inferno'
import { default as utils, sq } from '-/utils'
import './Threejs01.scss'

const didMount = (subscribe) => {
  console.log('didMount')
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)//new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#threejs') })
  //renderer.setSize(400, 400)
  renderer.setSize(window.innerWidth, window.innerHeight)
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

const Threejs = () => {
  return (
    <canvas id='threejs'></canvas>
  )
}

const Threejs01 = ({ subscribe }) => {
  return (
    <div id="threejs01">
      <h1> Hello World </h1>
      <Threejs
        onComponentDidMount={ () => didMount(subscribe) }
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
