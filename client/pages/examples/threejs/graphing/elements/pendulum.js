import React from 'react'
import * as THREE from 'three'

import { createAxes, createPoint, addControls, addAxesLabels } from '../utils'

const WHITE = 0xffffff
const BLACK = 0x000000

const setupCamera = ({ domain, margin }) => {
  const camera = new THREE.OrthographicCamera(
    domain[0] - margin[0],
    domain[1] + margin[1],
    domain[1] + margin[2],
    domain[0] - margin[3],
    0.1,
    1000
  )
  camera.updateProjectionMatrix()
  camera.position.z = 100
  camera.position.x = 0
  camera.position.y = 0
  return camera
}

const init = ({ state }) => {
  const canvas = document.getElementById('pendulum')

  const domain = [-10, 10]
  const gridSize = 1
  // left, right, top, bottom
  const margin = [2, 2, 2, 2]

  let scene = new THREE.Scene()
  const camera = setupCamera({ domain, margin })

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(WHITE)

  const light = new THREE.AmbientLight(WHITE)
  scene.add(light)

  const p = createPoint({ size: 0.25, color: 0x0000ff })
  scene.add(p)

  addControls({ camera, renderer })

  const radius = 4
  // initial time
  const t_0 = 0
  // initial displacement
  const d_0 = 0
  // initial angular velocity
  const w_0 = 0.5 * Math.PI
  // initial angular acceleration
  const a = 0

  const grid = new THREE.GridHelper(
    domain[1] - domain[0],
    (domain[1] - domain[0]) / gridSize,
    0x000000,
    0xbbbbbb
  )
  grid.rotation.x = Math.PI / 2
  scene.add(grid)

  const axes = createAxes({ size: (domain[1] - domain[0]) / 2, fontSize: 0 })
  scene.add(axes)

  addAxesLabels({ scene, domain, gridSize })

  const ellipseCurve = new THREE.EllipseCurve(
    0,
    0,
    radius,
    radius,
    0,
    Math.PI,
    false,
    0
  )
  const points = ellipseCurve.getPoints(20)
  const pointsGeometry = new THREE.BufferGeometry().setFromPoints(points)
  const pointsMaterial = new THREE.LineDashedMaterial({
    color: BLACK,
    linewidth: 2,
    scale: 1,
    dashSize: 0.25,
    gapSize: 0.25,
  })
  const curve = new THREE.Line(pointsGeometry, pointsMaterial)
  scene.add(curve)

  let lastMousePos = { x: 0.5, y: 0.5 }
  const mousePos = (event) => {
    const bounds = event.target.getBoundingClientRect()
    // const center = {
    //   x: (bounds.right - bounds.left) / 2,
    //   y: (bounds.bottom - bounds.top) / 2
    // }
    const xy = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
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
      y,
    }
  }
  canvas.onmouseleave = () => {
    lastMousePos = { x: 0.5, y: 0.5 }
  }

  const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0).normalize(),
    new THREE.Vector3(0, 0, 0),
    radius,
    BLACK
  )
  scene.add(arrowHelper)

  const objectState = state.select('object')
  let thenSecs = 0
  const animate = (now) => {
    if (!renderer) {
      return
    }

    requestAnimationFrame(animate)
    const nowSecs = now * 0.001
    const deltaSecs = nowSecs - thenSecs
    thenSecs = nowSecs

    const t = nowSecs
    const w_i = w_0 + a * t
    const d_i = Math.radians(0 + Math.degrees(w_i * t))

    const d_x = radius * Math.cos(d_i)
    const d_y = radius * Math.sin(d_i)

    p.position.set(d_x, d_y, 0)

    arrowHelper.setDirection(new THREE.Vector3(d_x, d_y, 0).normalize())

    const crv = new THREE.EllipseCurve(0, 0, radius, radius, 0, d_i, false, 0)
    curve.geometry.setFromPoints(crv.getPoints(32))
    curve.computeLineDistances()
    curve.geometry.verticesNeedUpdate = true

    // arrows.map(arrow => {
    //   const newDir = new THREE.Vector3(
    //     Math.cos(arrow.position.y + nowSecs * 3),
    //     Math.sin(arrow.position.x + nowSecs),
    //     Math.sin(arrow.position.x + nowSecs) * 2
    //   )
    //   const newLength = newDir.length() * gridSize * 0.6
    //   arrow.setDirection(newDir.normalize())
    //   const headLength = 0.5 * newLength
    //   const headWidth = 0.35 * headLength
    //   arrow.setLength(newLength, headLength, headWidth)
    // })
    //
    // mouseArrows.map(arrow => {
    //   const newDir = new THREE.Vector3(
    //     (lastMousePos.x * 2 - 1) * (domain[1] + 1) - arrow.position.x,
    //     -1 * (lastMousePos.y * 2 - 1) * (domain[1] + 1) - arrow.position.y,
    //     0
    //   )
    //   const newLength = Math.min(1, 3 / newDir.length())
    //   arrow.setDirection(newDir.normalize())
    //   const headLength = 0.5 * newLength
    //   const headWidth = 0.35 * headLength
    //   arrow.setLength(newLength, headLength, headWidth)
    // })

    if (deltaSecs) {
      const rotationSpeed = objectState.get('rotationSpeed')
      // objects.map(object => {
      //   object.rotation.x += rotationSpeed.x * deltaSecs
      //   object.rotation.y += rotationSpeed.y * deltaSecs
      //   object.rotation.z += rotationSpeed.z * deltaSecs
      //
      //   const dir = new THREE.Vector3(
      //     Math.cos(object.position.y + nowSecs * 3) * 0.1 +
      //       ((lastMousePos.x * 2 - 1) * domain[1] - object.position.x) / 200,
      //     Math.sin(object.position.x + nowSecs) * 0.1 +
      //       (-1 * (lastMousePos.y * 2 - 1) * domain[1] - object.position.y) /
      //         200,
      //     0
      //   )
      //   object.position.x += dir.x / object.mass / 10
      //   object.position.y += dir.y / object.mass / 10
      //   object.position.z = dir.z / object.mass / 10
      //   if (object.position.x < domain[0]) {
      //     object.position.x = domain[1]
      //   }
      //   if (object.position.y < domain[0]) {
      //     object.position.y = domain[1]
      //   }
      //   if (object.position.x > domain[1]) {
      //     object.position.x = domain[0]
      //   }
      //   if (object.position.y > domain[1]) {
      //     object.position.y = domain[0]
      //   }
      // })
    }

    renderer.render(scene, camera)
  }
  animate()

  return () => {
    renderer.dispose()

    scene = null
    renderer = null
  }
}

const Pendulum = ({ state, labels }) => {
  console.log(labels)
  React.useEffect(() => {
    if (document.getElementById('pendulum')) {
      return init({ state })
    }
  })

  return <canvas id="pendulum" />
}

export { init }
export default Pendulum
