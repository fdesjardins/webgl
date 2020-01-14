import React from 'react'
import * as THREE from 'three'
import threeOrbitControls from 'three-orbit-controls'
import { FaceNormalsHelper } from 'three/examples/jsm/helpers/FaceNormalsHelper'

import { createAxes, createLineGraph, create3dGraph } from '../utils'

const init = ({ state }) => {
  const canvas = document.getElementById('ex1')

  let scene = new THREE.Scene()

  const camera = new THREE.OrthographicCamera(
    canvas.clientWidth / -2,
    canvas.clientWidth / 2,
    canvas.clientWidth / 2,
    canvas.clientWidth / -2,
    0.1,
    1000
  )
  camera.zoom = 4
  camera.updateProjectionMatrix()
  camera.position.z = 65
  camera.position.x = 27
  camera.position.y = 7

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  // renderer.shadowMap.enabled = true
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  // scene.background = new THREE.Color(0xffffff)
  scene.background = new THREE.Color(0x000000)

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.update()

  const light = new THREE.PointLight(0xffffff, 2, 100)
  light.position.set(0, 0, 20)
  scene.add(light)

  const geometry = new THREE.IcosahedronGeometry(1)
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
  const object = new THREE.Mesh(geometry, material)
  const faceNormals = new FaceNormalsHelper(object, 2, 0x00ff00, 1)
  object.add(faceNormals)
  object.add(createAxes({ size: 12, fontSize: 2 }))
  scene.add(object)

  const xyGrid = new THREE.GridHelper(100, 20, 0x444444, 0x444444)
  scene.add(xyGrid)
  const xzGrid = new THREE.GridHelper(100, 20, 0x444444, 0x444444)
  xzGrid.rotation.x = Math.PI / 2
  scene.add(xzGrid)
  const zyGrid = new THREE.GridHelper(100, 20, 0x444444, 0x444444)
  zyGrid.rotation.z = Math.PI / 2
  scene.add(zyGrid)

  const { object: lineGraph, animate: animateLineGraph } = createLineGraph(
    t => x => 5 * Math.sin(x + t / 200),
    'f(x) = 5 * sin(x)',
    0x00ff00,
    'dashed'
  )
  const { object: lineGraph2, animate: animateLineGraph2 } = createLineGraph(
    t => x => 20 + 5 * Math.sin(x + t / 200),
    'f(x) = 20 + 5 * sin(x)',
    0xff0000
  )
  lineGraph2.rotation.y = Math.PI / 2
  scene.add(lineGraph)
  scene.add(lineGraph2)

  const { object: graph3d, animate: animate3dGraph } = create3dGraph()
  scene.add(graph3d)

  const axes = createAxes({ size: 50 })
  scene.add(axes)

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

    // animateGraph1(now)
    // animateGraph2(now)
    animateLineGraph(now)
    animateLineGraph2(now)
    animate3dGraph(now)

    if (deltaSecs) {
      const rotationSpeed = objectState.get('rotationSpeed')
      object.rotation.x += rotationSpeed.x * deltaSecs
      object.rotation.y += rotationSpeed.y * deltaSecs
      object.rotation.z += rotationSpeed.z * deltaSecs
      object.position.x = Math.cos(nowSecs) * 50
      object.position.y = Math.sin(nowSecs) * 50

      objectState.set('position', object.position)
      objectState.set('rotation', {
        x: object.rotation.x,
        y: object.rotation.y,
        z: object.rotation.z
      })

      // axes.children.map(child => child.lookAt(camera.position))
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

const BasicsOrtho = ({ state, labels }) => {
  React.useEffect(() => {
    if (document.getElementById('ex1')) {
      return init({ state })
    }
  })

  return <canvas id="ex1" />
}

export { init }
export default BasicsOrtho
