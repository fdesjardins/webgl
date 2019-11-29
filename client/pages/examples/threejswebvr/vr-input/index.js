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

  //force webgl2 context (for oculus quest compat)
  const context = canvas.getContext( 'webgl2', { alpha: false } );

  let renderer = new THREE.WebGLRenderer({ canvas, context })
  renderer.vr.enabled = true
  const button = VRButton.createButton(renderer)
  document.getElementById('webvr-button').appendChild(button)

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff })

  let controller1 = renderer.vr.getController( 0 );
  //controller1.addEventListener( 'selectstart', onSelectStart );
  //controller1.addEventListener( 'selectend', onSelectEnd );
  scene.add( controller1 );

  const hand = new THREE.IcosahedronBufferGeometry( 0.1, 2 );

  let controller1sphere = new THREE.Mesh( hand, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
  // controller1sphere.scale.x = 0.1
  // controller1sphere.scale.y = 0.1
  // controller1sphere.scale.z = 0.1
  controller1sphere.position.x = controller1.position.x
  controller1sphere.position.y = controller1.position.y
  controller1sphere.position.z = controller1.position.z

  scene.add(controller1sphere)

  let controller2 = renderer.vr.getController( 1 );
  //controller2.addEventListener( 'selectstart', onSelectStart );
  //controller2.addEventListener( 'selectend', onSelectEnd );
  scene.add( controller2 );
  let controller2sphere = new THREE.Mesh( hand, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
  // controller1sphere.scale.x = 0.1
  // controller1sphere.scale.y = 0.1
  // controller1sphere.scale.z = 0.1

  controller2sphere.position.x = controller2.position.x
  controller2sphere.position.y = controller2.position.y
  controller2sphere.position.z = controller2.position.z
  scene.add(controller2sphere)

  const room = new THREE.LineSegments(
    new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
    new THREE.LineBasicMaterial( { color: 0x808080 } )
  );
  room.geometry.translate( 0, 3, 0 );
  scene.add( room );

  let light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  light.position.set(0, 4, 0)
  scene.add(light)

  const animate = () => {
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera)
      controller1sphere.position.x = controller1.position.x
      controller1sphere.position.y = controller1.position.y
      controller1sphere.position.z = controller1.position.z

      controller2sphere.position.x = controller2.position.x
      controller2sphere.position.y = controller2.position.y
      controller2sphere.position.z = controller2.position.z

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

const VRInput = ({ children }, { store }) => (
  <div id="threejsvr01">
    <span id="webvr-button" />
    <Example notes={notes} didMount={update} didUpdate={update} />
  </div>
)

export default VRInput
