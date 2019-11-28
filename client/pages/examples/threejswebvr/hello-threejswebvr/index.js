import React from 'react'
import ReactDOM from 'react'
import * as THREE from 'three'
import  'three/examples/js/vr/HelioWebXRPolyfill.js'
import Example from '-/components/example'
import notes from './readme.md'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

let button
let renderer
const didMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )

  camera.position.z = 0
  camera.position.x = 10
  camera.position.z = 0

  camera.rotation. x = 1.6
  camera.rotation. y = 1.6

  renderer = new THREE.WebGLRenderer({ canvas })
  renderer.vr.enabled = true
  button = VRButton.createButton(renderer)
  document.getElementById('webvr-button').appendChild(button)

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshPhongMaterial({ color: 0x666666 })
  //const material = new THREE.MeshBasicMaterial({ color: 0x666666 })
  const cube = new THREE.Mesh(geometry, material)
  cube.matrixAutoUpdate = true
  //cube.castShadow = true
  scene.add(cube)

  // const planeGeometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100)
  // const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  // const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  // plane.position.z = -2
  // plane.position.y = 0
  // plane.position.x = 0
  // plane.rotation.x = 0
  // plane.rotation.y = 0
  // plane.receiveShadow = true
  // scene.add(plane)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 0, 12)
  // light.castShadow = true
  // light.shadow.mapSize.width = 1024
  // light.shadow.mapSize.height = 1024
  // light.shadow.camera.near = 0.5
  // light.shadow.camera.far = 500
  scene.add(light)

  const animate = () => {
    // requestAnimationFrame(animate)
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera)
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01

      //camera.rotation.y += 0.01
      //console.log(camera.rotation.y)
    })

    renderer.render(scene, camera)
  }
  animate()
}

const update = () =>
  didMount({
    canvas: document.querySelector('#threejsvr01 canvas'),
    container: document.querySelector('#threejsvr01')
  })

const HelloWebVr = ({ children }, { store }) => (
  <div id="threejsvr01">
    <span id="webvr-button" />
    <Example notes={notes} didMount={update} didUpdate={update} />
  </div>
)

export default HelloWebVr
