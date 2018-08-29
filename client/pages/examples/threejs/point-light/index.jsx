import React from 'react'
import { lifecycle } from 'recompose'
import * as THREE from 'three'
import Baobab from 'baobab'
import jsxToString from 'jsx-to-string'

import Example from '-/components/example'
import ObjectProperties from './elements/object-controls'
import LightProperties from './elements/light-controls'
import { default as utils, sq } from '-/utils'
import './Threejs02.scss'
import notes from './readme.md'

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
    scale: [ 1.0, 1.0, 1.0 ],
    rotationSpeed: {
      x: 0.01,
      y: 0.01,
      z: 0.01
    }
  }
})

const componentDidMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    1000
  )
  camera.position.z = 3

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0xffffff)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(-12, 12, 6)
  light.castShadow = true
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 500
  scene.add(light)

  const geometry = new THREE.IcosahedronBufferGeometry(1)
  const material = new THREE.MeshPhongMaterial({ color: 0x666666 })
  const cube = new THREE.Mesh(geometry, material)
  cube.matrixAutoUpdate = true
  cube.castShadow = true
  scene.add(cube)

  const planeGeometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100)
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.position.z = -2
  plane.position.y = -1
  plane.position.x = 1.5
  plane.rotation.x = -1.5
  plane.rotation.y = -0.9
  plane.receiveShadow = true
  scene.add(plane)

  const objectState = state.select('object')
  const lightState = state.select('light')
  const animate = () => {
    requestAnimationFrame(animate)

    cube.rotation.x += objectState.get([ 'rotationSpeed', 'x' ])
    cube.rotation.y += objectState.get([ 'rotationSpeed', 'y' ])
    cube.rotation.z += objectState.get([ 'rotationSpeed', 'z' ])

    cube.material.color.setHex(parseInt(objectState.get('color'), 16))

    cube.scale.set(...objectState.get('scale'))

    light.color.setHex(parseInt(lightState.get('color'), 16))
    if (lightState.get([ 'shadow', 'dispose' ]) === true) {
      light.shadow.mapSize.width = lightState.get('shadow').mapSize.width || 16
      light.shadow.mapSize.height = lightState.get('shadow').mapSize.width || 16
      light.shadow.map.dispose()
      light.shadow.map = null
    }

    renderer.render(scene, camera)
  }
  animate()
}

const wrap = (Component, { ...first }) => ({ children, context, ...rest }) => (
  <Component { ...first } { ...rest }>
    {children}
  </Component>
)

const PointLightExampleBase = () => (
  <div id="threejs02">
    <Example
      notes={ notes }
      components={ {
        ObjectProperties: wrap(ObjectProperties, {
          objectCursor: state.select('object')
        }),
        LightProperties: wrap(LightProperties, {
          lightCursor: state.select('light')
        })
      } }
    />
  </div>
)

const PointLightExample = lifecycle({
  componentDidMount: () =>
    componentDidMount({
      canvas: document.querySelector('canvas'),
      container: document.querySelector('#threejs02')
    })
})(PointLightExampleBase)

export default PointLightExample
