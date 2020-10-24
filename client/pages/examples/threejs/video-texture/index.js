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
  const url = 'https://storage.googleapis.com/avcp-camera-images/447B.mp4'

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

const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()
  const video = setupVideo()

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    1000
  )
  camera.position.z = 0.001

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera)
  controls.update()

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0xffffff)

  const light = new THREE.AmbientLight(0xffffff)
  scene.add(light)

  const videoTexture = new THREE.VideoTexture(video)
  videoTexture.format = THREE.RGBFormat
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.magFilter = THREE.LinearFilter
  videoTexture.needsUpdate = true
  videoTexture.anisotropy = renderer.getMaxAnisotropy()

  // const texture = new THREE.TextureLoader().load(
  //   'https://storage.googleapis.com/avcp-camera-images/new-ken.jpg'
  // )
  // texture.anisotropy = renderer.getMaxAnisotropy()

  const geometry = new THREE.SphereBufferGeometry(10, 32, 32)
  const material = new THREE.MeshPhongMaterial({
    map: videoTexture,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide
  })
  material.map.minFilter = THREE.LinearFilter
  material.map.maxFilter = THREE.LinearFilter

  const object = new THREE.Mesh(geometry, material)
  object.matrixAutoUpdate = true
  scene.add(object)

  const animate = () => {
    object.rotation.y += 0.0025

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

const PointLightExample = () => <Example notes={notes} init={init} />

export default PointLightExample
