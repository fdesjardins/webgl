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
  }
})

const setupVideo = () => {
  const url = 'https://storage.googleapis.com/avcp-camera-images/ken.mp4'

  const video = document.createElement('video')
  video.autoplay = true
  video.muted = true
  video.loop = true
  video.crossOrigin = 'anonymous'
  video.src = url
  video.load()
  video.play()

  return video
}

const didMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()
  const video = setupVideo()

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

  const light2 = light.clone()
  light2.position.set(0, 0, 30)
  scene.add(light2)

  const videoTexture = new THREE.VideoTexture(video)
  videoTexture.format = THREE.RGBFormat
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.magFilter = THREE.LinearFilter
  videoTexture.needsUpdate = true

  const geometry = new THREE.SphereBufferGeometry(5, 32, 32)
  const material = new THREE.MeshPhongMaterial({
    map: videoTexture,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide
  })
  const object = new THREE.Mesh(geometry, material)
  object.matrixAutoUpdate = true
  object.castShadow = true
  object.position.z = -1
  scene.add(object)

  const planeGeometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100)
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.position.z = -50
  plane.receiveShadow = true
  scene.add(plane)

  const planeGeometry3 = new THREE.PlaneBufferGeometry(10, 10, 10, 10)
  const planeMaterial3 = new THREE.MeshStandardMaterial({ color: 0x000000 })
  const plane3 = new THREE.Mesh(planeGeometry3, planeMaterial3)
  plane3.position.z = -30
  plane3.position.x = 10
  plane3.receiveShadow = true
  scene.add(plane3)

  const objectState = state.select('object')
  const animate = () => {
    requestAnimationFrame(animate)

    object.rotation.x += objectState.get(['rotationSpeed', 'x'])
    object.rotation.y += objectState.get(['rotationSpeed', 'y'])
    object.rotation.z += objectState.get(['rotationSpeed', 'z'])

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
