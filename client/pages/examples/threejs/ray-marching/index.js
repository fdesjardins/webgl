import React from 'react'
import * as THREE from 'three'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'

import Example from '-/components/example'
import threeOrbitControls from 'three-orbit-controls'
import notes from './readme.md'
import fs from './fs2.glsl'

const vs = `
varying vec2 texCoord;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);

  texCoord = vec2(gl_Position.x, gl_Position.y);
}`

const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    1000
  )
  camera.position.x = 0
  camera.position.y = 0
  camera.position.z = -5

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0xffffff)

  // const OrbitControls = threeOrbitControls(THREE)
  // const controls = new OrbitControls(camera, renderer.domElement)
  // controls.enableDamping = true
  const controls = new FirstPersonControls(camera, renderer.domElement)
  controls.lookSpeed = 0.1
  controls.movementSpeed = 4
  controls.noFly = true
  controls.lookVertical = true
  controls.constrainVertical = true
  controls.verticalMin = 1.0
  controls.verticalMax = 2.0
  controls.lon = -150
  controls.lat = 120
  // controls.update()

  // const controls = new FlyControls(camera, renderer.domElement)
  // controls.movementSpeed = 10
  // controls.domElement = renderer.domElement
  // controls.rollSpeed = Math.PI / 24
  // controls.autoForward = false
  // controls.dragToLook = false

  const iTime = {
    type: 'f',
    value: 100.0
  }
  const cameraPos = {
    type: 'vec3',
    value: new THREE.Vector3(0.0, 0.0, 0.0)
  }
  const cameraDir = {
    type: 'vec3',
    value: new THREE.Vector3(1.0, 0.0, 0.0)
  }
  const geometry = new THREE.PlaneBufferGeometry(20, 20, 20, 20)
  const material = new THREE.ShaderMaterial({
    fragmentShader: fs,
    vertexShader: vs,
    uniforms: {
      iTime,
      cameraPos,
      cameraDir
    }
  })
  const object = new THREE.Mesh(geometry, material)
  scene.add(object)

  scene.add(new THREE.GridHelper(100, 0))
  const camDirection = new THREE.Vector3()

  const clock = new THREE.Clock()

  let thenSecs = 0
  const animate = now => {
    const nowSecs = now * 0.001
    const deltaSecs = nowSecs - thenSecs
    thenSecs = nowSecs

    const delta = clock.getDelta()
    controls.update(delta)

    iTime.value += delta
    // cameraPos.value.copy(camera.position)
    cameraPos.value.copy(camera.position)

    camera.getWorldDirection(camDirection)
    object.position.copy(camera.position.clone().add(camDirection))
    object.lookAt(camera.position)

    cameraDir.value.copy(camDirection)

    if (renderer) {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
  }
  animate()

  return () => {
    renderer.dispose()
    scene.dispose()
    scene = null
    renderer = null
  }
}

const ExampleContainer = () => {
  return (
    <div id="container">
      <Example notes={notes} init={init} />
    </div>
  )
}

export default ExampleContainer
