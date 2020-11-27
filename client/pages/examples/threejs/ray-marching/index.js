import React from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
// import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'

import Example from '-/components/example'
import notes from './readme.md'
// import { OrbitControls } from './orbitControls'
import fs from './fs3.glsl'
import { vec3 } from '-/utils'
import rustyMetalTexImage from '-/assets/rusty-metal-512x512.jpg'

const rustyMetal = new THREE.TextureLoader().load(rustyMetalTexImage)

const vs = `
varying vec2 texCoord;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);

  texCoord = vec2(gl_Position.x, gl_Position.y);
}`

const orbitControls = (camera, domElement) => {
  const controls = new OrbitControls(camera, domElement)
  controls.target = vec3(0.0, 0.0, 0.0)
  controls.rotateSpeed = 1.5
  return controls
}

// const fpsControls = (camera, domElement) => {
//   const controls = new FirstPersonControls(camera, domElement)
//   controls.lookSpeed = 0.1
//   controls.movementSpeed = 4
//   controls.noFly = true
//   controls.lookVertical = true
//   controls.constrainVertical = true
//   controls.verticalMin = 1.0
//   controls.verticalMax = 2.0
//   controls.lon = -150
//   controls.lat = 120
//   controls.update()
//   return controls
// }

// const flyControls = (camera, domElement) => {
//   const controls = new FlyControls(camera, domElement)
//   controls.movementSpeed = 10
//   controls.domElement = domElement
//   controls.rollSpeed = Math.PI / 24
//   controls.autoForward = false
//   return controls
// }

const createUniforms = (canvas) => {
  return {
    iTime: {
      type: 'f',
      value: 100.0,
    },
    iResolution: {
      type: 'vec2',
      value: new THREE.Vector2(canvas.width, canvas.height),
    },
    cameraPos: {
      type: 'vec3',
      value: new THREE.Vector3(),
    },
    cameraDir: {
      type: 'vec3',
      value: new THREE.Vector3(),
    },
    iChannel0: {
      type: 'sampler2D',
      value: rustyMetal,
    },
  }
}

const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    1000
  )
  camera.position.set(2, 5, 8)
  camera.lookAt(0, 0, 0)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0xffffff)
  // renderer.context.disable(renderer.context.DEPTH_TEST)

  const controls = orbitControls(camera, renderer.domElement)
  // const controls = flyControls(camera, renderer.domElement)
  controls.enableDamping = true

  const uniforms = createUniforms(canvas)
  const geometry = new THREE.PlaneBufferGeometry(20, 20, 20, 20)
  const material = new THREE.ShaderMaterial({
    fragmentShader: fs,
    vertexShader: vs,
    side: THREE.DoubleSide,
    uniforms,
  })
  const object = new THREE.Mesh(geometry, material)
  scene.add(object)

  scene.add(
    new THREE.GridHelper(
      100,
      60,
      new THREE.Color(0x666666),
      new THREE.Color(0x222222)
    )
  )
  const camDirection = new THREE.Vector3()

  const clock = new THREE.Clock()

  const animate = (now) => {
    const delta = clock.getDelta()
    controls.update(delta)

    camera.getWorldDirection(camDirection)
    camDirection.normalize()
    object.position.copy(
      camera.position.clone().add(camDirection.multiplyScalar(13))
    )
    object.lookAt(camera.position.clone())
    // object.rotation.set(camera.rotation)

    uniforms.iTime.value += delta
    uniforms.cameraPos.value.copy(camera.position)
    uniforms.cameraDir.value.copy(camDirection)

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

const ExampleContainer = () => {
  return (
    <div id="container">
      <Example notes={notes} init={init} />
    </div>
  )
}

export default ExampleContainer
