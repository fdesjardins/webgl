import Inferno from 'inferno'
import { default as utils, sq } from '-/utils'
import './Threejs01.scss'

const didMount = (subscribe) => {
  console.log('didMount')
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, 640/ 480, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#threejs') })
  renderer.setSize(680, 480)

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

  const updateCubePos = ({ pos, width, height, color }) => {
    cube.position.x = pos.x
    cube.position.y = pos.y
  }
  subscribe(updateCubePos)

  animate()
}

const Threejs = () => {
  return (
    <canvas id='threejs'></canvas>
  )
}

const Controls = ({ moveLeft, moveRight, moveUp, moveDown }) => {
  return (
    <div class='controls'>
      <button onClick={ () => moveLeft(1) }>left</button>
      <button onClick={ () => moveRight(1) }>right</button>
      <button onClick={ () => moveUp(1) }>up</button>
      <button onClick={ () => moveDown(1) }>down</button>
    </div>
  )
}

const Threejs01 = ({ subscribe, controls }) => {
  return (
    <div id="threejs01">
      <h1> Hello World </h1>
      <Threejs
        onComponentDidMount={ () => didMount(subscribe) }
      />
      <Controls
        moveLeft={ controls.moveLeft }
        moveRight={ controls.moveRight }
        moveUp={ controls.moveUp }
        moveDown={ controls.moveDown }
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
      controls={ store.select(sq('Threejs01.controls')).get() }
      onComponentShouldUpdate={ utils.shouldUpdate }
    />
  )
}
