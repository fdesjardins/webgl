import React from 'react'
import ReactDOM from 'react'
import * as THREE from 'three'
import  'three/examples/js/vr/HelioWebXRPolyfill.js'
import Example from '-/components/example'
import notes from './readme.md'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';

const didMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )

  camera.position.x = 0
  camera.position.y = 2
  camera.position.z = 0

  camera.rotation. x = 0
  camera.rotation. y = 0

  //force webgl2 context
  const context = canvas.getContext( 'webgl2', { alpha: false } );

  let renderer = new THREE.WebGLRenderer({ canvas, context })
  renderer.vr.enabled = true
  const button = VRButton.createButton(renderer)
  document.getElementById('webvr-button').appendChild(button)

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshPhongMaterial({ color: 0xff00ff })
  const cube = new THREE.Mesh(geometry, material)
  cube.matrixAutoUpdate = true
  cube.castShadow = true

  cube.position.x = 0
  cube.position.y = 2
  cube.position.z = -2
  scene.add(cube)

  const room = new THREE.LineSegments(
    new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
    new THREE.LineBasicMaterial( { color: 0x808080 } )
  );
  room.geometry.translate( 0, 3, 0 );
  scene.add( room );

  const light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  light.position.set(0, 4, 0)
  scene.add(light)

  const animate = () => {
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
    canvas: document.querySelector('#threejsvr00 canvas'),
    container: document.querySelector('#threejsvr00')
  })

const HelloWebVr = ({ children }, { store }) => (
  <div id="threejsvr00">
    <span id="webvr-button" />
    <Example notes={notes} didMount={update} didUpdate={update} />
  </div>
)

export default HelloWebVr
