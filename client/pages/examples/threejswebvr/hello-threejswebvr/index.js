import React from 'react'
import ReactDOM from 'react'
import * as THREE from 'three'

import Example from '-/components/example'
import notes from './readme.md'
import { WEBVR } from '../jsm/vr/WebVR.js'

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
  button = WEBVR.createButton( renderer )
  renderer.vr.enabled = true;

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0xaaff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const animate = () => {
    //requestAnimationFrame(animate)
    renderer.setAnimationLoop( function () {

    	renderer.render( scene, camera );

    } );
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

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
    <Example notes={notes} didMount={update} didUpdate={update} />
  </div>

).appendchild(button)

export default HelloWebVr
