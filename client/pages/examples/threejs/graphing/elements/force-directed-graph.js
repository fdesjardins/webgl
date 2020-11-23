import React from 'react'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'

import {
  createAxes,
  createLabel,
  addControls,
  createPoint,
  addAxesLabels,
  createConnectingLine
} from '../utils'

const WHITE = 0xffffff
const BLACK = 0x000000

const setupCamera = ({ domain, margin }) => {
  const width = domain[1] - domain[0]
  const camera = new THREE.OrthographicCamera(
    -width / 2 - margin[0],
    width / 2 + margin[1],
    width / 2 + margin[2],
    -width / 2 - margin[3],
    0.1,
    1000
  )
  camera.updateProjectionMatrix()
  camera.position.z = 100
  return camera
}

const init = ({ state }) => {
  const canvas = document.getElementById('force-directed-graph')
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(WHITE)
  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const domain = [0, 10]
  const gridSize = 1
  // left, right, top, bottom
  const margin = [1, 1, 1, 1]

  const center = (domain[1] + domain[0]) / 2

  const camera = setupCamera({ domain, margin })
  const controls = addControls({ camera, renderer })
  controls.target.set(center, center, 0)
  controls.update()

  const light = new THREE.AmbientLight(WHITE)
  scene.add(light)

  const grid = new THREE.GridHelper(
    domain[1] - domain[0],
    (domain[1] - domain[0]) / gridSize,
    0x000000,
    0xbbbbbb
  )
  grid.rotation.x = Math.PI / 2
  grid.position.set(center, center, 0)
  scene.add(grid)

  const points = []
  for (let i = 0; i < 20; i += 1) {
    const p = createPoint({ size: gridSize / 4, color: 0x0000ff })
    p.position.set(
      center + (Math.random() - 0.5) * domain[1],
      center + (Math.random() - 0.5) * domain[1],
      0
    )
    scene.add(p)
    points.push(p)
  }
  //
  // const lines = []
  // points.map((p0, i) => {
  //   points.map((p1, j) => {
  //     if (i < j) {
  //       lines.push(createConnectingLine(p0, p1, 0xcccccc))
  //     }
  //   })
  // })
  // lines.map(l => scene.add(l))

  const axes = createAxes({ size: (domain[1] - domain[0]) / 2, fontSize: 0 })
  axes.position.set(center, center, 0)
  scene.add(axes)
  addAxesLabels({ scene, domain, gridSize })

  let lastMousePos = { x: 0.5, y: 0.5 }
  const mousePos = (event) => {
    const bounds = event.target.getBoundingClientRect()
    const xy = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    }
    const x = (xy.x / event.target.clientWidth) * 2 - 1
    const y = -((xy.y / event.target.clientHeight) * 2 - 1)
    return [x, y]
  }
  canvas.onmousemove = (event) => {
    const [x, y] = mousePos(event)
    lastMousePos = {
      x,
      y
    }
  }
  let label
  canvas.onmouseleave = () => {
    lastMousePos = { x: 0.5, y: 0.5 }
    if (label) {
      scene.remove(label)
      label = null
    }
  }

  points.map((p) => {
    const F = new THREE.Vector3(1, 1, 1)
    // console.log(p.position.distanceTo(F))
    points.map((otherP) => {
      const dist = p.position.distanceTo(otherP.position)
      // if (dist && dist !== Infinity) {
      //   const fstr = 2.0 * (1 / dist ** 2)
      //   const fdir = otherP.position.sub(p.position)
      //   const f = fdir.normalize().multiplyScalar(fstr)
      //   // F = F.add(f)
      // }
    })

    // p.position.set(p.position.multiply(F))
  })

  const raycaster = new THREE.Raycaster()

  const createTween = (fromPos, toPos, onUpdate = () => {}) => {
    const newTween = new TWEEN.Tween(fromPos)
      .to(toPos, 2000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(onUpdate)
      .start()
    return newTween
  }

  let thenSecs = 0
  const animate = (now) => {
    if (!renderer) {
      return
    }
    TWEEN.update()
    controls.update()
    requestAnimationFrame(animate)
    const nowSecs = now * 0.001
    const deltaSecs = nowSecs - thenSecs
    thenSecs = nowSecs

    if (nowSecs % 3 < 0.025) {
      points.map((p) =>
        createTween(p.position, {
          x: center + (Math.random() - 0.5) * domain[1],
          y: center + (Math.random() - 0.5) * domain[1]
        })
      )
    }

    // lines.map(l => {
    //   l.geometry.verticesNeedUpdate = true
    // })

    const mousePosVec = new THREE.Vector2(lastMousePos.x, lastMousePos.y)
    raycaster.setFromCamera(mousePosVec, camera)
    const intersects = raycaster.intersectObjects(points)
    if (label) {
      label.lookAt(camera.position)
    }

    if (intersects.length === 0 && label) {
      scene.remove(label)
      label = null
    }
    if (intersects.length > 0) {
      const target = intersects[0]
      const pos = target.object.position
      if (label) {
        scene.remove(label)
        label = null
      }
      label = createLabel({
        text: `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`,
        color: BLACK,
        size: 0.5
      })
      label.position.set(
        target.object.position.x,
        target.object.position.y,
        target.object.position.z
      )
      label.lookAt(camera.position)
      const labelToCam = label.position.clone().sub(camera.position)
      labelToCam.normalize()
      label.position.sub(labelToCam.multiplyScalar(10))
      scene.add(label)
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

const ForceDirectedGraph = ({ state, labels }) => {
  React.useEffect(() => {
    if (document.getElementById('force-directed-graph')) {
      return init({ state })
    }
  })
  return <canvas id="force-directed-graph" />
}

export { init }
export default ForceDirectedGraph
