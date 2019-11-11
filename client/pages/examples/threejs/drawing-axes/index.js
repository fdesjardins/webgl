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
    scale: [ 1.0, 1.0, 1.0 ],
    rotationSpeed: {
      x: 0.0,
      y: 0.0,
      z: 0.5 * Math.PI
    }
  }
})

const didMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    1000
  )
  camera.position.x = 15
  camera.position.y = 15
  camera.position.z = 35

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera)
  controls.update()

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0x000000)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 0, 30)
  light.castShadow = true
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 500
  scene.add(light)

  const geometry = new THREE.IcosahedronGeometry(5)
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
  const object = new THREE.Mesh(geometry, material)
  object.matrixAutoUpdate = true
  object.castShadow = true
  const faceNormals = new THREE.FaceNormalsHelper(object, 2, 0x00ff00, 1)
  object.add(faceNormals)
  object.add(new THREE.AxesHelper(12))
  scene.add(object)

  scene.add(new THREE.GridHelper(100, 0))
  scene.add(new THREE.AxesHelper(50))

  const objectState = state.select('object')
  let thenSecs = 0
  const animate = (now) => {
    requestAnimationFrame(animate)
    const nowSecs = now * 0.001
    const deltaSecs = nowSecs - thenSecs
    thenSecs = nowSecs

    if (deltaSecs) {
      const rotationSpeed = objectState.get('rotationSpeed')
      object.rotation.x += rotationSpeed.x * deltaSecs
      object.rotation.y += rotationSpeed.y * deltaSecs
      object.rotation.z += rotationSpeed.z * deltaSecs
      object.position.x = Math.cos(nowSecs) * 20
      object.position.y = Math.sin(nowSecs) * 10
    }

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
    <Example
      notes={ notes }
      didMount={ update }
      didUpdate={ update }
    />
  </div>
)

export default PointLightExample
