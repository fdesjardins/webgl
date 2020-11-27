import React from 'react'
import * as THREE from 'three'

import Example from '-/components/example'
import notes from './readme.md'
import { createAxes, addControls } from '../graphing/utils'

// const config = {
//   initialPosition: new THREE.Vector3(3.0, 0.0, 0.0),
//   anchorPosition: new THREE.Vector3(0.0, 0.0, 0.0)
// }

const setupPerspectiveCamera = ({ width, height }) => {
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
  camera.position.x = 0
  camera.position.y = 0
  camera.position.z = 35
  return camera
}

const init = ({ canvas }) => {
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const ambientLight = new THREE.AmbientLight(0x707070)
  scene.add(ambientLight)

  const camera = setupPerspectiveCamera({
    width: canvas.width,
    height: canvas.height,
  })
  scene.add(camera)

  const controls = addControls({ camera, renderer })
  // controls.target.set(config.initialPosition, config.initialPosition, 0)
  controls.update()

  const range = [0, 18]
  const gridSize = 1
  const grid = new THREE.GridHelper(
    range[1] - range[0],
    (range[1] - range[0]) / gridSize,
    0xbbbbbb,
    0x444444
  )
  grid.rotation.x = Math.PI / 2
  scene.add(grid)

  const axes = createAxes({ size: 10, fontSize: 0.25 })
  scene.add(axes)

  // const dt = 0.025

  // const note = {
  //   label: 'A',
  //   frequency: 1200
  // }

  // const zoom = 200

  // const speedOfSound = 343
  // h-bar J⋅s
  // const hbar = 1.054571817e-34
  // const p = 1e8
  // const c = 299792458
  // const wavelength = c / note.frequency
  // const amplitude = 0.5 * Math.PI
  //
  // const i = 0

  // const { object: lineGraph, animate: animateLineGraph } = createLineGraph(
  //   (t) => (x) => {
  //     // console.log(t * 0.001)
  //     if (i < 3) {
  //       i++
  //
  //       console.log(x, Math.pow(Math.E, (p * x) / hbar))
  //     }
  //     return Math.pow(Math.E, (p * x) / hbar)
  //   },
  //   'f(x) = 2 * sin(x)',
  //   0xff0000,
  //   'solid',
  //   range
  // )
  // scene.add(lineGraph)

  const animate = (now) => {
    if (!renderer) {
      return
    }
    requestAnimationFrame(animate)

    // animateLineGraph(now)

    renderer.render(scene, camera)
  }
  animate()

  return () => {
    renderer.dispose()

    scene = null
    renderer = null
  }
}

const Basic = () => {
  React.useEffect(() => {
    const canvas = document.getElementById('basic')
    if (canvas) {
      return init({ canvas })
    }
  })
  return <canvas id="basic" />
}

const E = () => (
  <Example
    notes={notes}
    components={{
      Basic,
    }}
  />
)

export default E
