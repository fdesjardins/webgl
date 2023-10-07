import React from 'react'
import PT from 'prop-types'
import * as THREE from 'three'
// import 'three/examples/js/vr/HelioWebXRPolyfill.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'

export const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )

  camera.position.x = 0
  camera.position.y = 2
  camera.position.z = 0

  camera.rotation.x = 0
  camera.rotation.y = 0

  // force webgl2 context (for oculus quest compat)
  const context = canvas.getContext('webgl2', { alpha: false })

  let renderer = new THREE.WebGLRenderer({ canvas, context })
  renderer.xr.enabled = true
  const button = VRButton.createButton(renderer)
  container.appendChild(button)
  renderer.setSize(container.clientWidth, container.clientWidth)
  // const geometry = new THREE.BoxGeometry(1, 1, 1)
  // const material = new THREE.MeshPhongMaterial({ color: 0xffffff })

  const hand1 = renderer.xr.getController(0)
  // hand1.addEventListener( 'selectstart', onSelectStart );
  // hand1.addEventListener( 'selectend', onSelectEnd );
  scene.add(hand1)

  const hand = new THREE.IcosahedronBufferGeometry(0.08, 1)
  hand.scale(0.2, 0.8, 1.5)

  const hand1mesh = new THREE.Mesh(
    hand,
    new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
  )
  // hand1mesh.scale.x = 0.1
  // hand1mesh.scale.y = 0.1
  // hand1mesh.scale.z = 0.1
  hand1mesh.position.x = hand1.position.x
  hand1mesh.position.y = hand1.position.y
  hand1mesh.position.z = hand1.position.z

  scene.add(hand1mesh)

  const hand2 = renderer.xr.getController(1)
  // hand2.addEventListener( 'selectstart', onSelectStart );
  // hand2.addEventListener( 'selectend', onSelectEnd );
  scene.add(hand2)
  const hand2mesh = new THREE.Mesh(
    hand,
    new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff,
      flatShading: true,
    })
  )
  // hand1mesh.scale.x = 0.1
  // hand1mesh.scale.y = 0.1
  // hand1mesh.scale.z = 0.1

  hand2mesh.position.x = hand2.position.x
  hand2mesh.position.y = hand2.position.y
  hand2mesh.position.z = hand2.position.z
  scene.add(hand2mesh)

  const room = new THREE.LineSegments(
    new BoxLineGeometry(6, 6, 6, 10, 10, 10),
    new THREE.LineBasicMaterial({ color: 0x808080 })
  )
  room.geometry.translate(0, 3, 0)
  scene.add(room)

  const light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 4, 0)
  scene.add(light)

  const animate = () => {
    renderer.setAnimationLoop(() => {
      if (!renderer) {
        return
      }
      renderer.render(scene, camera)
      hand1mesh.position.x = hand1.position.x
      hand1mesh.position.y = hand1.position.y
      hand1mesh.position.z = hand1.position.z

      hand2mesh.position.x = hand2.position.x
      hand2mesh.position.y = hand2.position.y
      hand2mesh.position.z = hand2.position.z

      hand1mesh.quaternion.w = hand1.quaternion.w
      hand1mesh.quaternion.x = hand1.quaternion.x
      hand1mesh.quaternion.y = hand1.quaternion.y
      hand1mesh.quaternion.z = hand1.quaternion.z

      hand2mesh.quaternion.w = hand2.quaternion.w
      hand2mesh.quaternion.x = hand2.quaternion.x
      hand2mesh.quaternion.y = hand2.quaternion.y
      hand2mesh.quaternion.z = hand2.quaternion.z
    })

    renderer.render(scene, camera)
  }
  animate()

  return () => {
    renderer.dispose()

    scene = null
    renderer = null
  }
}

const VRInput = ({ children }, { store }) => (
  <div id="threejsvr01">
    <span id="webvr-button" />
  </div>
)
VRInput.propTypes = {
  children: PT.node,
}

export const options = {
  display: 'fullscreen',
}
export const meta = {
  tags: 'threejs,webvr',
  title: 'VR Input',
  slug: 'vr-input',
}
