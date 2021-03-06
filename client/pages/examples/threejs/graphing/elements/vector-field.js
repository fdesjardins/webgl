import React from 'react'
import * as THREE from 'three'
import threeOrbitControls from 'three-orbit-controls'

import { createAxes, createLabel } from '../utils'

const init = ({ state }) => {
  const canvas = document.getElementById('ex3')

  let scene = new THREE.Scene()

  const domain = [-2 * Math.PI, 2 * Math.PI]
  const gridSize = Math.PI / 4
  // left, right, top, bottom
  const margin = [1, 1, 1, 1]

  const camera = new THREE.OrthographicCamera(
    domain[0] - margin[0],
    domain[1] + margin[1],
    domain[1] + margin[2],
    domain[0] - margin[3],
    0.1,
    1000
  )
  camera.updateProjectionMatrix()
  camera.position.z = 500
  camera.position.x = 0
  camera.position.y = 0

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0xffffff)

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.update()

  const light = new THREE.PointLight(0xffffff, 2, 100)
  light.position.set(0, 0, 20)
  scene.add(light)

  const objects = []
  // const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x0000ff]
  for (let o = 0; o < 64; o += 1) {
    const mass = Math.random() * 0.15 + 0.1
    const geometry = new THREE.SphereBufferGeometry(mass)

    const material = new THREE.MeshLambertMaterial({
      color: mass < 0.15 ? 0x333333 : mass < 0.2 ? 0x555555 : 0x999999,
    })
    const object = new THREE.Mesh(geometry, material)
    object.mass = mass
    object.position.y = (Math.random() * 2 - 1) * domain[1]
    object.position.x = (Math.random() * 2 - 1) * domain[1]
    scene.add(object)
    objects.push(object)
  }

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

  const arrows = []
  for (let x = domain[0]; x <= domain[1]; x += gridSize) {
    for (let y = domain[0]; y <= domain[1]; y += gridSize) {
      const arrowDir = new THREE.Vector3(Math.cos(x), Math.sin(y), 0)
      const length = arrowDir.length() * gridSize * 0.9
      arrowDir.normalize()
      const arrowOrigin = new THREE.Vector3(x, y, 0)
      const color = 0x222222
      const headLength = 0.5 * length
      const headWidth = 0.35 * headLength
      const arrowHelper = new THREE.ArrowHelper(
        arrowDir,
        arrowOrigin,
        length,
        color,
        headLength,
        headWidth
      )
      scene.add(arrowHelper)
      arrows.push(arrowHelper)
    }
  }

  for (let y = domain[0]; y <= domain[1]; y += gridSize * 2) {
    const label = createLabel({ text: y.toFixed(0), size: 0.3 })
    const bbox = new THREE.Box3().setFromObject(label)
    label.position.y = y - bbox.getSize().y / 2
    label.position.x = domain[0] - bbox.getSize().x * 2.5
    scene.add(label)
  }
  for (let x = domain[0]; x <= domain[1]; x += gridSize * 2) {
    const label = createLabel({ text: x.toFixed(0), size: 0.3 })
    const bbox = new THREE.Box3().setFromObject(label)
    label.position.x = x - bbox.getSize().x / 2
    label.position.y = -1 * domain[1] - bbox.getSize().y * 2.5
    scene.add(label)
  }

  // const title = createLabel({
  //   text: 'v = (cos(x+t), sin(x+t), 0)',
  //   size: 0.4
  // })
  // const bbox = new THREE.Box3().setFromObject(title)
  // title.position.y = domain[1] + bbox.getSize().y * 1.5
  // title.position.x = 0 - bbox.getSize().x / 2
  // scene.add(title)

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

    arrows.map((arrow) => {
      const newDir = new THREE.Vector3(
        Math.cos(arrow.position.y + nowSecs * 3),
        Math.sin(arrow.position.x + nowSecs),
        Math.sin(arrow.position.x + nowSecs) * 2
      )
      const newLength = newDir.length() * gridSize * 0.6
      arrow.setDirection(newDir.normalize())
      const headLength = 0.5 * newLength
      const headWidth = 0.35 * headLength
      arrow.setLength(newLength, headLength, headWidth)
    })

    if (deltaSecs) {
      const rotationSpeed = objectState.get('rotationSpeed')
      objects.map((object) => {
        object.rotation.x += rotationSpeed.x * deltaSecs
        object.rotation.y += rotationSpeed.y * deltaSecs
        object.rotation.z += rotationSpeed.z * deltaSecs

        const dir = new THREE.Vector3(
          Math.cos(object.position.y + nowSecs * 3) * 0.1,
          Math.sin(object.position.x + nowSecs) * 0.1,
          Math.sin(object.position.x + nowSecs) * 2
        )
        object.position.x += dir.x / object.mass / 10
        object.position.y += dir.y / object.mass / 10
        object.position.z = dir.z / object.mass / 10
        if (object.position.x < domain[0]) {
          object.position.x = domain[1]
        }
        if (object.position.y < domain[0]) {
          object.position.y = domain[1]
        }
        if (object.position.x > domain[1]) {
          object.position.x = domain[0]
        }
        if (object.position.y > domain[1]) {
          object.position.y = domain[0]
        }
      })
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

const VectorField = ({ state, labels }) => {
  console.log(labels)
  React.useEffect(() => {
    if (document.getElementById('ex3')) {
      return init({ state })
    }
  })

  return <canvas id="ex3" />
}

export { init }
export default VectorField
