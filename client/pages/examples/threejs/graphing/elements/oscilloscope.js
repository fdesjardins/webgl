import React from 'react'
import * as THREE from 'three'
import threeOrbitControls from 'three-orbit-controls'

import { createAxes, createLineGraph, createLabel } from '../utils'

const WHITE = 0xffffff
const BLACK = 0x000000

const init = ({ state }) => {
  const canvas = document.getElementById('oscilloscope')

  let scene = new THREE.Scene()

  const range = [-2 * Math.PI, 2 * Math.PI]
  const gridSize = Math.PI / 4
  // left, right, top, bottom
  const margin = [1, 1, 1, 1]

  const camera = new THREE.OrthographicCamera(
    range[0] - margin[0],
    range[1] + margin[1],
    range[1] + margin[2],
    range[0] - margin[3],
    0.1,
    1000
  )
  camera.position.z = 500
  camera.position.x = 0
  camera.position.y = 0
  camera.updateProjectionMatrix()

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(BLACK)

  const light = new THREE.PointLight(WHITE, 2, 100)
  light.position.set(0, 0, 20)
  scene.add(light)

  const grid = new THREE.GridHelper(
    range[1] - range[0],
    (range[1] - range[0]) / gridSize,
    0xbbbbbb,
    0x444444
  )
  grid.rotation.x = Math.PI / 2
  scene.add(grid)

  const axes = createAxes({ size: (range[1] - range[0]) / 2, fontSize: 0 })
  scene.add(axes)
  //
  // for (let y = range[0]; y <= range[1]; y += gridSize * 2) {
  //   const label = createLabel({ text: y.toFixed(0), size: 0.3, color: WHITE })
  //   const bbox = new THREE.Box3().setFromObject(label)
  //   label.position.y = y - bbox.getSize().y / 2
  //   label.position.x = range[0] - bbox.getSize().x * 2.5
  //   scene.add(label)
  // }
  // for (let x = range[0]; x <= range[1]; x += Math.PI) {
  //   const label = createLabel({
  //     text: `${(x / Math.PI).toFixed(0)} PI`,
  //     size: 0.3,
  //     color: WHITE
  //   })
  //   const bbox = new THREE.Box3().setFromObject(label)
  //   label.position.x = x - bbox.getSize().x / 2
  //   label.position.y = -1 * range[1] - bbox.getSize().y * 2.5
  //   scene.add(label)
  // }

  const resizeRendererToDisplaySize = (renderer) => {
    const canvas = renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      renderer.setSize(width, height, false)
    }
    return needResize
  }

  let lastMousePos = { x: 0.5, y: 0.5 }
  const mousePos = (event) => {
    const bounds = event.target.getBoundingClientRect()
    // const center = {
    //   x: (bounds.right - bounds.left) / 2,
    //   y: (bounds.bottom - bounds.top) / 2
    // }
    const xy = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    }
    const x = xy.x / event.target.clientWidth
    const y = xy.y / event.target.clientHeight
    // const x = event.target.clientX / event.target.clientWidth
    // const x = (event.clientX / window.innerWidth) * 2 - 1
    // const y = event.clientY / event.target.clientHeight
    return [x, y]
  }
  canvas.onmousemove = (event) => {
    const [x, y] = mousePos(event)
    lastMousePos = {
      x,
      y
    }
  }

  const note = {
    label: 'A',
    frequency: 1200
  }

  const zoom = 200

  // const speedOfSound = 343
  const c = 299792458
  const wavelength = c / note.frequency
  const amplitude = 0.5 * Math.PI

  const { object: lineGraph, animate: animateLineGraph } = createLineGraph(
    (t) => (x) => {
      // console.log(t * 0.001)
      return 2 * amplitude * Math.sin((x * c) / wavelength / zoom)
    },
    'f(x) = 2 * sin(x)',
    0xeeee00,
    'solid',
    range
  )
  scene.add(lineGraph)

  const label = createLabel({
    text: `Freq: ${parseFloat(note.frequency).toFixed(4)}Hz`,
    size: 0.3,
    color: WHITE
  })
  label.position.set(range[0] + gridSize, range[1] - gridSize, 0)
  scene.add(label)

  const cycleLabel = createLabel({
    text: `Cycl: ${parseFloat(note.frequency).toFixed(4)}Hz`,
    size: 0.3,
    color: WHITE
  })
  cycleLabel.position.set(range[0] + gridSize, range[1] - gridSize * 2, 0)
  scene.add(cycleLabel)

  const vmaxLabel = createLabel({
    text: `Vmax: ${parseFloat(amplitude).toFixed(4)}V`,
    size: 0.3,
    color: WHITE
  })
  vmaxLabel.position.set(range[1] * 0.25 + gridSize, range[1] - gridSize, 0)
  scene.add(vmaxLabel)

  const vminLabel = createLabel({
    text: `Vmin: ${parseFloat(-1 * amplitude).toFixed(4)}V`,
    size: 0.3,
    color: WHITE
  })
  vminLabel.position.set(range[1] * 0.25 + gridSize, range[1] - gridSize * 2, 0)
  scene.add(vminLabel)

  console.log(wavelength)

  const objectState = state.select('object')
  let thenSecs = 0
  const animate = (now) => {
    if (!renderer) {
      return
    }
    if (resizeRendererToDisplaySize(renderer)) {
      const c = renderer.domElement
      // camera.aspect = c.clientWidth / c.clientHeight
      // camera.left = c.clientWidth / -2
      // camera.right = c.clientWidth / 2
      // camera.top = c.clientHeight / 2
      // camera.bottom = c.clientHeight / -2
      camera.updateProjectionMatrix()
    }

    requestAnimationFrame(animate)
    const nowSecs = now * 0.001
    const deltaSecs = nowSecs - thenSecs
    thenSecs = nowSecs

    if (deltaSecs) {
      const rotationSpeed = objectState.get('rotationSpeed')
    }

    animateLineGraph(now)

    renderer.render(scene, camera)
  }
  animate()

  return () => {
    renderer.dispose()

    scene = null
    renderer = null
  }
}

const Oscilloscope = ({ state, labels }) => {
  React.useEffect(() => {
    if (document.getElementById('oscilloscope')) {
      return init({ state })
    }
  })

  return <canvas id="oscilloscope" />
}

export { init }
export default Oscilloscope
