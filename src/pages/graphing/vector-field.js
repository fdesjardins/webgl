import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { createAxes } from './utils'

const createObjects = (n, domain) => {
  const objects = []
  for (let o = 0; o < n; o += 1) {
    const mass = Math.max(0.1, Math.random() * 0.25)
    const geometry = new THREE.SphereGeometry(mass)
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color(mass * 2, mass * 2, mass * 2),
    })
    const object = new THREE.Mesh(geometry, material)
    object.mass = mass
    object.position.y = (Math.random() * 2 - 1) * domain[1]
    object.position.x = (Math.random() * 2 - 1) * domain[1]
    objects.push(object)
  }
  // Add an update method to each object
  objects.forEach((o) => {
    o.update = (nowSecs) => {
      const dir = new THREE.Vector3(
        Math.cos(o.position.y + nowSecs * 3) * 0.1,
        Math.sin(o.position.x + nowSecs) * 0.1,
        Math.sin(o.position.x + nowSecs) * 2
      )
      o.position.x += dir.x / o.mass / 10
      o.position.y += dir.y / o.mass / 10
      o.position.z = dir.z / o.mass / 5

      // Boundary handling; wrap around in the X and Y axes
      if (o.position.x < domain[0]) {
        o.position.x = domain[1]
      }
      if (o.position.y < domain[0]) {
        o.position.y = domain[1]
      }
      if (o.position.x > domain[1]) {
        o.position.x = domain[0]
      }
      if (o.position.y > domain[1]) {
        o.position.y = domain[0]
      }
    }
  })
  return objects
}

const createArrows = (domain, gridSize) => {
  const arrows = []
  for (let x = domain[0]; x <= domain[1]; x += gridSize) {
    for (let y = domain[0]; y <= domain[1]; y += gridSize) {
      const arrowDir = new THREE.Vector3(Math.cos(x), Math.sin(y), 0)
      const length = arrowDir.length() * gridSize * 0.9
      arrowDir.normalize()
      const arrowOrigin = new THREE.Vector3(x, y, 0)
      const color = 0x777777
      const headLength = 0.25 * length
      const headWidth = 0.25 * headLength
      const arrowHelper = new THREE.ArrowHelper(
        arrowDir,
        arrowOrigin,
        length,
        color,
        headLength,
        headWidth
      )
      arrows.push(arrowHelper)
    }
  }
  // Add an update method to each arrow
  arrows.forEach((a) => {
    a.update = (nowSecs) => {
      const newDir = new THREE.Vector3(
        Math.cos(a.position.y + nowSecs * 3),
        Math.sin(a.position.x + nowSecs),
        Math.sin(a.position.x + nowSecs) * 2
      )
      const newLength = newDir.length() * gridSize * 0.6
      a.setDirection(newDir.normalize())
      const headLength = 0.5 * newLength
      const headWidth = 0.35 * headLength
      a.setLength(newLength, headLength, headWidth)
    }
  })

  return arrows
}

export const init = ({ canvas, container }) => {
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
  camera.position.set(0, 0, 500)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  scene.background = new THREE.Color(0x000000)
  const controls = new OrbitControls(camera, canvas)
  controls.update()

  const light = new THREE.PointLight(0xffffff, 3, 100)
  light.position.set(0, 10, 40)
  scene.add(light)

  const handleResize = (event) => {
    if (event) {
      event.preventDefault()
    }
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  }
  window.addEventListener('resize', handleResize, false)
  handleResize()

  // Create grid lines
  const grid = new THREE.GridHelper(
    domain[1] - domain[0],
    (domain[1] - domain[0]) / gridSize,
    0x000000,
    0x999999
  )
  grid.rotation.x = Math.PI / 2
  scene.add(grid)

  // Create axes indicators
  const axes = createAxes({ size: (domain[1] - domain[0]) / 2, fontSize: 0.5 })
  scene.add(axes)

  // Create the objects to push around according to the vector forces
  const objects = createObjects(64, domain)
  objects.forEach((o) => scene.add(o))

  // Create the arrow indicators at each point in the grid
  const arrows = createArrows(domain, gridSize)
  arrows.forEach((o) => scene.add(o))

  const animate = (now) => {
    if (!renderer) {
      return
    }
    requestAnimationFrame(animate)

    const nowSecs = (now || 0.001) * 0.001

    arrows.forEach((a) => a.update(nowSecs))
    objects.forEach((o) => o.update(nowSecs))

    // Ensure the axes labels face us
    axes.children.forEach((child) => child.lookAt(camera.position))

    renderer.render(scene, camera)
  }
  animate()

  return () => {
    renderer.dispose()
    controls.dispose()
    scene = null
    renderer = null
    window.removeEventListener('resize', handleResize)
  }
}
