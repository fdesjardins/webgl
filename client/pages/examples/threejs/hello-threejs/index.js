import React from 'react'
import { default as utils, sq } from '-/utils'
import * as THREE from 'three'

import Example from '-/components/example'
import notes from './readme.md'

const didMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )
  camera.position.z = 3

  const renderer = new THREE.WebGLRenderer({ canvas })

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0xaaff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const animate = () => {
    requestAnimationFrame(animate)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderer.render(scene, camera)
  }
  animate()
}

const update = () =>
  didMount({
    canvas: document.querySelector('#threejs01 canvas'),
    container: document.querySelector('#threejs01')
  })

export default ({ children }, { store }) => (
  <div id="threejs01">
    <Example notes={notes} didMount={update} didUpdate={update} />
  </div>
)
