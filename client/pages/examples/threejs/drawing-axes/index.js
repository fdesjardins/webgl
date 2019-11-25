import React from 'react'
import * as THREE from 'three'
import Baobab from 'baobab'

import droidSans from '-/assets/fonts/helvetiker_bold.typeface.json'
import Example from '-/components/example'
import notes from './readme.md'
import threeOrbitControls from 'three-orbit-controls'

import ObjectProperties from './elements/object-controls'
import Stats from './elements/stats'

const state = new Baobab({
  light: {
    color: 'ffffff',
    castShadow: true,
    shadow: {
      dispose: false,
      mapSize: {
        width: 1024,
        height: 1024
      }
    }
  },
  object: {
    color: 'ffffff',
    scale: [1.0, 1.0, 1.0],
    rotationSpeed: {
      x: 0.0,
      y: 0.5,
      z: 0.5
    },
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    }
  }
})

const createAxes = ({ size, fontSize = 3 }) => {
  const fontLoader = new THREE.FontLoader()
  const font = fontLoader.parse(droidSans)
  const axes = new THREE.AxesHelper(size)

  const xLabel = new THREE.Mesh(
    new THREE.TextGeometry('X', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3
    }),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  )
  xLabel.position.x = size
  axes.add(xLabel)

  const yLabel = new THREE.Mesh(
    new THREE.TextGeometry('Y', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3
    }),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  )
  yLabel.position.y = size
  axes.add(yLabel)

  const zLabel = new THREE.Mesh(
    new THREE.TextGeometry('-Z', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3
    }),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  )
  zLabel.position.z = size
  axes.add(zLabel)

  return axes
}

const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.1, 1000)
  camera.position.x = 45
  camera.position.y = 45
  camera.position.z = 90

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0xffffff)

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.update()

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 0, 30)
  light.castShadow = true
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 500
  scene.add(light)

  const geometry = new THREE.IcosahedronGeometry(5)
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
  const object = new THREE.Mesh(geometry, material)
  object.matrixAutoUpdate = true
  object.castShadow = true
  const faceNormals = new THREE.FaceNormalsHelper(object, 2, 0x00ff00, 1)
  object.add(faceNormals)
  object.add(createAxes({ size: 12, fontSize: 2 }))
  scene.add(object)

  scene.add(new THREE.GridHelper(100, 0))

  const axes = createAxes({ size: 50 })
  scene.add(axes)

  const objectState = state.select('object')
  let thenSecs = 0
  const animate = now => {
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
        z: object.rotation.z
      })

      axes.children.map(child => child.lookAt(camera.position))
    }

    if (renderer) {
      renderer.render(scene, camera)
    }
  }
  animate()

  return () => {
    renderer.dispose()
    scene.dispose()
    scene = null
    renderer = null
  }
}

const wrap = (Component, { ...first }) => ({ children, context, ...rest }) => (
  <Component {...first} {...rest}>
    {children}
  </Component>
)

const PointLightExample = () => (
  <Example
    notes={notes}
    components={{
      Stats: wrap(Stats, {
        getPosition: () => state.get(['object', 'position']),
        getRotation: () => state.get(['object', 'rotation'])
      }),
      ObjectProperties: wrap(ObjectProperties, {
        objectCursor: state.select('object')
      })
    }}
    init={init}
  />
)

export default PointLightExample
