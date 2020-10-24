import React from 'react'
import * as THREE from 'three'
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {DeviceOrientationControls} from 'three/examples/jsm/controls/DeviceOrientationControls.js'
import Example from '-/components/example'
import notes from './readme.md'

let rand = Math.random

const init = ({ canvas, container }) => {
  let renderer = new THREE.WebGLRenderer({ canvas })
  let scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )
  let clock = new THREE.Clock()

  camera.position.z = 10
  camera.position.y = 5

   const randInt = () =>{
     return Math.floor(Math.random() * 10);
   }
  const size = 50;
  const divisions = 50;
  let gridHelper = new THREE.GridHelper( size, divisions );
  gridHelper.position.x=0
  gridHelper.position.y=0
  gridHelper.position.z=0
  scene.add( gridHelper );

  renderer.setSize(container.clientWidth, container.clientWidth)

  const light = new THREE.PointLight(0xffffff, 2, 100)
  light.position.set(0, 1, -3)
  scene.add(light)


  let camControls = new DeviceOrientationControls(camera)
  camControls.lookSpeed = 0.4
  camControls.movementSpeed = 4
  camControls.noFly = true
  camControls.lookVertical = true
  camControls.constrainVertical = true
  camControls.verticalMin = 1.0
  camControls.verticalMax = 2.0
  camControls.lon = -150
  camControls.lat = 120

  const animate = () => {
    //camControls.update(clock.getDelta())
    camControls.update()

    if (renderer) {
      requestAnimationFrame(animate)

      renderer.render(scene, camera)
    }

  }

animate()

return () => {
    renderer.dispose()
    
    scene = null
    renderer = null
  }
}

const DeviceOrientation = () => <Example notes={notes} init={init} />

export default React.memo(DeviceOrientation)
