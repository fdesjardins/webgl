import React from 'react'
import * as THREE from 'three'
import threeOrbitControls from 'three-orbit-controls'

import { createAxes, createLabel } from '../utils'

const init = ({ state }) => {
  const canvas = document.getElementById('ex4')

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
  camera.position.z = 500
  camera.position.x = 0
  camera.position.y = 0
  // camera.zoom = 37.999
  camera.updateProjectionMatrix()

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0xffffff)

  // const OrbitControls = threeOrbitControls(THREE)
  // const controls = new OrbitControls(camera, renderer.domElement)
  // controls.enableDamping = true
  // controls.update()

  const light = new THREE.PointLight(0xffffff, 2, 100)
  light.position.set(0, 0, 20)
  scene.add(light)

  const objects = []
  // const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x0000ff]
  for (let o = 0; o < 64; o += 1) {
    const mass = Math.random() * 0.15 + 0.1
    const geometry = new THREE.SphereBufferGeometry(mass)

    const material = new THREE.MeshLambertMaterial({
      color: mass < 0.15 ? 0x333333 : mass < 0.2 ? 0x555555 : 0x999999
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
  const mouseArrows = []
  for (let x = domain[0]; x <= domain[1]; x += gridSize) {
    for (let y = domain[0]; y <= domain[1]; y += gridSize) {
      const arrowDir = new THREE.Vector3(0.1, 0, 0)
      const length = arrowDir.length()
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
      const mouseArrow = arrowHelper.clone()
      mouseArrow.setColor(0xcccccc)
      mouseArrows.push(mouseArrow)
      scene.add(mouseArrow)
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

  const resizeRendererToDisplaySize = renderer => {
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
  const mousePos = event => {
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
  canvas.onmousemove = event => {
    const [x, y] = mousePos(event)
    lastMousePos = {
      x,
      y
    }
  }
  canvas.onmouseleave = () => {
    lastMousePos = { x: 0.5, y: 0.5 }
  }

  const objectState = state.select('object')
  let thenSecs = 0
  const animate = now => {
    if (!renderer) {
      return
    }
    if (resizeRendererToDisplaySize(renderer)) {
      const c = renderer.domElement
      camera.aspect = c.clientWidth / c.clientHeight
      camera.left = c.clientWidth / -2
      camera.right = c.clientWidth / 2
      camera.top = c.clientHeight / 2
      camera.bottom = c.clientHeight / -2
      camera.updateProjectionMatrix()
    }

    requestAnimationFrame(animate)
    const nowSecs = now * 0.001
    const deltaSecs = nowSecs - thenSecs
    thenSecs = nowSecs

    arrows.map(arrow => {
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

    mouseArrows.map(arrow => {
      const newDir = new THREE.Vector3(
        (lastMousePos.x * 2 - 1) * (domain[1] + 1) - arrow.position.x,
        -1 * (lastMousePos.y * 2 - 1) * (domain[1] + 1) - arrow.position.y,
        0
      )
      const newLength = Math.min(1, 3 / newDir.length())
      arrow.setDirection(newDir.normalize())
      const headLength = 0.5 * newLength
      const headWidth = 0.35 * headLength
      arrow.setLength(newLength, headLength, headWidth)
    })

    if (deltaSecs) {
      const rotationSpeed = objectState.get('rotationSpeed')
      objects.map(object => {
        object.rotation.x += rotationSpeed.x * deltaSecs
        object.rotation.y += rotationSpeed.y * deltaSecs
        object.rotation.z += rotationSpeed.z * deltaSecs

        const dir = new THREE.Vector3(
          Math.cos(object.position.y + nowSecs * 3) * 0.1 +
            ((lastMousePos.x * 2 - 1) * domain[1] - object.position.x) / 200,
          Math.sin(object.position.x + nowSecs) * 0.1 +
            (-1 * (lastMousePos.y * 2 - 1) * domain[1] - object.position.y) /
              200,
          0
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
    scene.dispose()
    scene = null
    renderer = null
  }
}

const Oscilloscope = ({ state, labels }) => {
  console.log(labels)
  React.useEffect(() => {
    if (document.getElementById('ex4')) {
      return init({ state })
    }
  })

  return (
    <div style={{ width: '500px', height: '500px' }}>
      <canvas id="ex4" />
    </div>
  )
}

export { init }
export default Oscilloscope
