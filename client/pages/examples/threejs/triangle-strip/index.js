import React from 'react'
import * as THREE from 'three'

import Example from '-/components/example'
import notes from './readme.md'

const init = ({ canvas, container }) => {
  let renderer = new THREE.WebGLRenderer({ canvas })
  let scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )
  camera.position.z = 10
  camera.position.y = 5

  const size = 50
  const divisions = 50

  const gridHelper = new THREE.GridHelper(size, divisions)

  gridHelper.position.x = 0
  gridHelper.position.y = 0
  gridHelper.position.z = 0

  scene.add(gridHelper)

  renderer.setSize(container.clientWidth, container.clientWidth)

  const light = new THREE.PointLight(0xffffff, 2, 100)
  light.position.set(0, 1, -3)
  scene.add(light)

  // let stripVerts= new THREE.Vector3Array()
  // stripVerts.push(new THREE.Vector3(-1, 0, -5))
  // stripVerts.push(new THREE.Vector3(0, 1, -5))
  // stripVerts.push(new THREE.Vector3(1, 0, -5))
  // stripVerts.push(new THREE.Vector3(2, 1, -5))

  const stripVerts = new Float32Array([
    -5,
    0,
    -5,
    -4,
    3,
    -5,
    -3,
    0,
    -5,
    -2,
    3,
    -5,
    -1,
    0,
    -5,
    0,
    3,
    -5,
    1,
    0,
    -5,
    2,
    3,
    -5,
    3,
    0,
    -5,
    4,
    3,
    -5,
    5,
    0,
    -5,
  ])
  const stripGeometry = new THREE.BufferGeometry(stripVerts)
  stripGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(stripVerts, 3)
  )
  // BufferGeometryUtils.computeTangents(stripGeometry)
  stripGeometry.computeVertexNormals()
  stripGeometry.normalizeNormals()
  const stripMaterial = new THREE.MeshLambertMaterial({
    color: 0x999999,
    side: THREE.DoubleSide,
    flatShading: true,
  })

  const stripMesh = new THREE.Mesh(stripGeometry, stripMaterial)

  stripMesh.drawMode = THREE.TriangleStripDrawMode

  scene.add(stripMesh)

  // const sceneObjects = []

  const mouse = new THREE.Vector2()
  let click = false
  const onMouseClick = (event) => {
    console.log(stripVerts)
    // stripVerts.push(  3)
    // stripVerts.push(  0)
    // stripVerts.push( -5 )
    // stripVerts.push(  4, 1, -5  )
    console.log(event)
    click = true
  }
  const onMouseMove = (event) => {
    mouse.x = (event.offsetX / canvas.clientWidth) * 2 - 1
    mouse.y = -(event.offsetY / canvas.clientHeight) * 2 + 1
  }
  canvas.addEventListener('mousemove', onMouseMove, false)
  canvas.addEventListener('click', onMouseClick, false)
  const animate = () => {
    if (click) {
      click = false
    }
    if (renderer) {
      requestAnimationFrame(animate)

      renderer.render(scene, camera)
    }
  }

  animate()

  return () => {
    renderer.dispose()

    scene = null
    renderer = null
  }
}

const TriangleStrip = () => <Example notes={notes} init={init} />

export default React.memo(TriangleStrip)
