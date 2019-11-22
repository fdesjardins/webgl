import React from 'react'
import * as THREE from 'three'
import Baobab from 'baobab'

import Example from '-/components/example'
import notes from './readme.md'
import threeOrbitControls from 'three-orbit-controls'

const state = new Baobab({
  light: {
    color: 'ffffff',
    castShadow: true,
    shadow: {
      dispose: false,
      mapSize: {
        width: 1024,
        height: 1024
      }
    }
  },
  object: {
    color: 'ffffff',
    scale: [1.0, 1.0, 1.0],
    rotationSpeed: {
      x: 0.0,
      y: 0.005,
      z: 0.0
    }
  },
  board: {
    size: {
      w: 10,
      h: 10
    }
  }
})

const vs = `
varying vec2 texCoord;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);

  texCoord = vec2(gl_Position.x, gl_Position.y);
}`

const fs1 = `
varying vec2 texCoord;
void main(){
  vec2 coord = vec2(gl_FragCoord);

  if (
    mod( floor(texCoord.x) + floor(texCoord.y), 2.0 ) == 0.0) {
    gl_FragColor = vec4(1.);
  } else {
    gl_FragColor = vec4(0.);
  }
}`

const fs = `
uniform sampler2D texture;
varying vec2 vUv;
void main(){
  gl_FragColor = texture2D(texture, vUv);
}`

const texture = () => {
  const width = 10
  const height = 10
  const data = new Uint8Array(3 * width * height)
  for (let i = 0; i < width * height * 3; i++) {
    const stride = i * 3
    data[stride] = 255
    data[stride + 1] = 255
    data[stride + 2] = 255
    if (stride === 222) {
      data[stride] = 0
      data[stride + 1] = 0
      data[stride + 2] = 0
    }
  }
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBFormat)
  tex.needsUpdate = true
  return tex
}

const rtScene = () => {
  const width = 512
  const height = 512
  const renderTarget = new THREE.WebGLRenderTarget(width, height)
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.z = 3
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xff0000)
  const light = new THREE.PointLight(0xffffff, 1, 100)
  scene.add(light)

  return {
    renderTarget,
    scene,
    camera
  }
}

const didMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.1, 1000)
  camera.position.z = 3

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera)
  controls.update()

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0xffffff)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 0, 0)
  light.castShadow = true
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 500
  scene.add(light)

  const planeGeometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100)
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.position.z = -50
  plane.receiveShadow = true
  scene.add(plane)

  const { renderTarget, scene: renderTargetScene, camera: renderTargetCamera } = rtScene()

  const geometry = new THREE.PlaneBufferGeometry(10, 10, 10, 10)
  const material = new THREE.ShaderMaterial({
    vertexShader: vs,
    fragmentShader: fs,
    uniforms: {
      texture: {
        type: 't',
        value: texture()
      }
    }
  })
  const object = new THREE.Mesh(geometry, material)
  object.position.z = -15
  object.receiveShadow = true
  scene.add(object)

  const planeGeometry3 = new THREE.PlaneBufferGeometry(10, 10, 10, 10)
  const planeMaterial3 = new THREE.MeshStandardMaterial({ color: 0x000000 })
  const plane3 = new THREE.Mesh(planeGeometry3, planeMaterial3)
  plane3.position.z = -30
  plane3.position.x = 10
  plane3.receiveShadow = true
  scene.add(plane3)

  let then = 0
  const animate = now => {
    requestAnimationFrame(animate)
    const nowSecs = now * 0.001
    const deltaSecs = nowSecs - then
    then = nowSecs

    controls.update()

    // renderer.setRenderTarget(renderTarget)
    // renderer.render(renderTargetScene, renderTargetCamera)
    // renderer.setRenderTarget(null)

    renderer.render(scene, camera)
  }
  animate()
}

const update = () =>
  didMount({
    canvas: document.querySelector('canvas'),
    container: document.querySelector('#container')
  })

const PointLightExample = () => (
  <div id="container">
    <Example notes={notes} didMount={update} didUpdate={update} />
  </div>
)

export default PointLightExample
