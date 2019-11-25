import React from 'react'
import * as THREE from 'three'

import Example from '-/components/example'
import threeOrbitControls from 'three-orbit-controls'
import notes from './readme.md'
import fs from './fs.glsl'

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

  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.1, 1000)
  camera.position.x = 0
  camera.position.y = 3
  camera.position.z = -5

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0xffffff)

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.update()

  const iTime = {
    type: 'f',
    value: 100.0
  }
  const cameraPos = {
    type: 'vec3',
    value: camera.position
  }
  const geometry = new THREE.PlaneBufferGeometry(20, 20, 20, 20)
  const material = new THREE.ShaderMaterial({
    fragmentShader: fs,
    vertexShader: vs,
    uniforms: {
      iTime,
      cameraPos
    }
  })
  const object = new THREE.Mesh(geometry, material)
  scene.add(object)

  scene.add(new THREE.GridHelper(100, 0))

  let thenSecs = 0
  const animate = now => {
    const nowSecs = now * 0.001
    const deltaSecs = nowSecs - thenSecs
    thenSecs = nowSecs

    iTime.value += 0.01

    object.lookAt(camera.position)

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
