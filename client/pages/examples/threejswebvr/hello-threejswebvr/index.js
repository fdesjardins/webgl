import React from 'react'
import ReactDOM from 'react'
import * as THREE from 'three'

import Example from '-/components/example'
import notes from './readme.md'
import { WEBVR } from 'three/examples/jsm/vr/WebVR.js'

console.log(WEBVR)

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

  camera.position.z = 3

  renderer = new THREE.WebGLRenderer({ canvas })
  renderer.vr.enabled = true
  button = WEBVR.createButton(renderer)
  document.getElementById('webvr-button').appendChild(button)

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshPhongMaterial({ color: 0x666666 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(-12, 12, 6)
  light.castShadow = true
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 500
  scene.add(light)

  const animate = () => {
    // requestAnimationFrame(animate)
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera)
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
    })

    renderer.render(scene, camera)
  }
  animate()
}

const update = () =>
  didMount({
    canvas: document.querySelector('#threejs01 canvas'),
    container: document.querySelector('#threejs01')
  })

const HelloWebVr = ({ children }, { store }) => (
  <div id="threejs01">
    <span id="webvr-button" />
    <Example notes={notes} didMount={update} didUpdate={update} />
  </div>
)

export default HelloWebVr
