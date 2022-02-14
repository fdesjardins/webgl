import * as THREE from 'three'
import Baobab from 'baobab'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'

import inconsolataFont from '../../fonts/Inconsolata/Inconsolata_Regular.json'

const state = new Baobab({
  light: {
    color: 'ffffff',
    castShadow: true,
    shadow: {
      dispose: false,
      mapSize: {
        width: 1024,
        height: 1024,
      },
    },
  },
  object: {
    color: 'ffffff',
    scale: [1.0, 1.0, 1.0],
    rotationSpeed: {
      x: 0.0,
      y: 0.5,
      z: 0.5,
    },
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
})

const createAxes = ({ size, fontSize = 3 }) => {
  const fontLoader = new FontLoader()
  const font = fontLoader.parse(inconsolataFont)
  const axes = new THREE.AxesHelper(size)

  const xLabel = new THREE.Mesh(
    new TextGeometry('X', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3,
    }),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  xLabel.position.x = size
  axes.add(xLabel)

  const yLabel = new THREE.Mesh(
    new TextGeometry('Y', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3,
    }),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  yLabel.position.y = size
  axes.add(yLabel)

  const zLabel = new THREE.Mesh(
    new TextGeometry('-Z', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3,
    }),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  zLabel.position.z = size
  axes.add(zLabel)

  return axes
}

export const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  )
  camera.position.x = 45
  camera.position.y = 45
  camera.position.z = 90

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  scene.background = new THREE.Color(0x000000)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.update()

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

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 0, 30)
  light.castShadow = true
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 500
  scene.add(light)

  const geometry = new THREE.IcosahedronGeometry(8)
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
  const object = new THREE.Mesh(geometry, material)
  object.matrixAutoUpdate = true
  object.castShadow = true
  object.add(createAxes({ size: 12, fontSize: 2 }))
  // Highlight edges
  object.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    )
  )
  scene.add(object)

  scene.add(new THREE.GridHelper(100, 10, 0xffffff, 0x444444))

  const axes = createAxes({ size: 50 })
  scene.add(axes)

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

    if (deltaSecs) {
      const rotationSpeed = objectState.get('rotationSpeed')
      object.rotation.x += rotationSpeed.x * deltaSecs
      object.rotation.y += rotationSpeed.y * deltaSecs
      object.rotation.z += rotationSpeed.z * deltaSecs
      object.position.x = Math.cos(nowSecs) * 30
      object.position.y = Math.sin(nowSecs) * 30

      objectState.set('position', object.position)
      objectState.set('rotation', {
        x: object.rotation.x,
        y: object.rotation.y,
        z: object.rotation.z,
      })

      axes.children.map((child) => child.lookAt(camera.position))
    }
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
