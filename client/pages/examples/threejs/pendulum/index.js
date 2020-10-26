import React from 'react'
import * as THREE from 'three'

import Example from '-/components/example'
import notes from './readme.md'
import { createAxes, createPoint, addControls } from '../graphing/utils'

const config = {
  initialPosition: new THREE.Vector3(3.0, 0.0, 0.0),
  anchorPosition: new THREE.Vector3(0.0, 0.0, 0.0),
}

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

  const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0).normalize(),
    config.anchorPosition,
    0.0,
    0x000000
  )
  scene.add(arrowHelper)

  const controls = addControls({ camera, renderer })
  // controls.target.set(config.initialPosition, config.initialPosition, 0)
  controls.update()

  const axes = createAxes({ size: 10, fontSize: 0.25 })
  scene.add(axes)

  const f_gravity = new THREE.Vector3(0, -9.81, 0)

  const point = createPoint({ size: 0.25, color: 0x0000ff })
  point.mass = 1e-3
  point.lastPosition = new THREE.Vector3()
  point.position.copy(config.initialPosition)
  point.lastPosition.copy(point.position)
  point.f = new THREE.Vector3()
  scene.add(point)

  const point2 = createPoint({ size: 0.1, color: 0x0000ff })
  point2.mass = 1e-3
  point2.lastPosition = new THREE.Vector3()
  point2.position.copy(new THREE.Vector3(3.0, 0.0, 3.0))
  point2.lastPosition.copy(point2.position)
  point2.f = new THREE.Vector3()
  scene.add(point2)

  const anchor = createPoint({ size: 0.05, color: 0x000000 })
  anchor.position.copy(config.anchorPosition)
  scene.add(anchor)

  const springConst = 100.0
  const restLength = 3.0
  const tempPos = new THREE.Vector3()
  const dt = 0.025

  const animate = () => {
    if (!renderer) {
      return
    }
    requestAnimationFrame(animate)

    // Calc forces
    point.f.copy(f_gravity)
    const d = point.position.clone().sub(anchor.position)
    const l = d.length()
    point.f.add(
      d.normalize().multiplyScalar(-1 * springConst * (l - restLength))
    )
    point.v = point.position.clone().sub(point.lastPosition) / dt
    // const f_damper = 1 * point.v
    // point.f.add(f_damper)
    const dp = point.position.clone().sub(point2.position)
    const dpl = d.length()
    point.f.add(
      dp
        .normalize()
        .multiplyScalar(-1 * springConst * (dpl - restLength) * point2.mass)
    )

    point2.f.copy(f_gravity)
    const d2 = point2.position.clone().sub(point.position)
    const l2 = d2.length()
    point2.f.add(
      d2.normalize().multiplyScalar(-1 * springConst * (l2 - restLength))
    )

    // Integrate
    tempPos
      .copy(point.position)
      .multiplyScalar(2)
      .sub(point.lastPosition)
      .add(point.f.clone().multiplyScalar(dt ** 2))
    point.lastPosition.copy(point.position)
    point.position.copy(tempPos)

    tempPos
      .copy(point2.position)
      .multiplyScalar(2)
      .sub(point2.lastPosition)
      .add(point2.f.clone().multiplyScalar(dt ** 2))
    point2.lastPosition.copy(point2.position)
    point2.position.copy(tempPos)

    // Other updates
    arrowHelper.setDirection(
      point.position.clone().sub(anchor.position).normalize()
    )
    arrowHelper.setLength(point.position.clone().sub(anchor.position).length())

    renderer.render(scene, camera)
  }
  animate()

  return () => {
    renderer.dispose()

    scene = null
    renderer = null
  }
}

const Pendulum = () => {
  React.useEffect(() => {
    const canvas = document.getElementById('pendulum')
    if (canvas) {
      return init({ canvas })
    }
  })
  return <canvas id="pendulum" />
}

const E = () => (
  <Example
    notes={notes}
    components={{
      Pendulum,
    }}
  />
)

export default E
