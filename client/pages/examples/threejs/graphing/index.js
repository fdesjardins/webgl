import React from 'react'
import * as THREE from 'three'
import Baobab from 'baobab'

import droidSans from '-/assets/fonts/helvetiker_bold.typeface.json'
import Example from '-/components/example'
import notes from './readme.md'
import threeOrbitControls from 'three-orbit-controls'

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
    new THREE.MeshBasicMaterial({ color: 0xffffff })
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
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  yLabel.position.y = size
  axes.add(yLabel)

  // const zLabel = new THREE.Mesh(
  //   new THREE.TextGeometry('-Z', {
  //     size: fontSize,
  //     height: fontSize * 0.1,
  //     font,
  //     curveSegments: 3
  //   }),
  //   new THREE.MeshBasicMaterial({ color: 0x000000 })
  // )
  // zLabel.position.z = size
  // axes.add(zLabel)

  return axes
}

const createLabel = text => {
  const fontLoader = new THREE.FontLoader()
  const fontSize = 1.5
  const font = fontLoader.parse(droidSans)
  const label = new THREE.Mesh(
    new THREE.TextGeometry(text, {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3
    }),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  return label
}

const createGraph = (f, labelText) => {
  // const f = x => Math.sin(x)
  const range = [0, 20 * Math.PI]
  const res = 0.1

  const geometry = new THREE.SphereGeometry(0.25)
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
  const object = new THREE.Mesh(geometry, material)

  let i = 0
  const objects = []
  while (i <= range[1]) {
    const g = new THREE.SphereGeometry(0.25)
    const m = new THREE.MeshPhongMaterial({ color: 0xffffff })
    const o = new THREE.Mesh(g, m)
    o.position.x = i
    o.position.y = f(i)
    object.add(o)
    objects.push(o)
    i += res
  }

  const label = createLabel(labelText)
  label.position.y = 2
  object.add(label)

  object.matrixAutoUpdate = true
  const animate = () => {}
  // now => {
  //   objects.map(o => {
  //     o.position.y = f(o.position.x + now / 1000)
  //   })
  // }
  return { object, animate }
}

const createLineGraph = (f, labelText, color = 0x0000ff) => {
  // const f = t => x => 5 * Math.sin(x + t / 200)
  const range = [-10 * Math.PI, 10 * Math.PI]
  const res = 0.1

  let i = range[0]
  const points = []
  while (i <= range[1]) {
    points.push(new THREE.Vector3(i, f(0)(i), 0))
    i += res
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color, linewidth: 2 })
  const object = new THREE.Line(geometry, material)

  const label = createLabel(labelText)
  label.position.x = 5 * Math.PI + 1
  label.position.y = 6
  object.add(label)

  return {
    object,
    animate: now => {
      points.map((p, i) => {
        object.geometry.attributes.position.array[i * 3 + 1] = f(now)(p.x)
      })
      object.geometry.attributes.position.needsUpdate = true
    }
  }
}

const create3dGraph = (_, labelText) => {
  const f = t => (x, z, vec) => {
    vec.x = x * 20 * Math.PI - 10 * Math.PI
    vec.y = 2 * Math.sin(x * 20 * Math.PI + t) + 2 * Math.sin(z * 20 * Math.PI + t) - 20
    vec.z = z * 20 * Math.PI - 10 * Math.PI
  }
  const range = [-10 * Math.PI, 10 * Math.PI]
  const geometry = new THREE.ParametricBufferGeometry(f(0), 100, 100)
  const wireframe = new THREE.WireframeGeometry(geometry)
  const material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 1
  })
  const object = new THREE.LineSegments(wireframe, material)

  const label = createLabel('f(x,z) = sin(x) + sin(z)')
  label.position.y = -14
  label.position.x = 5 * Math.PI + 1
  object.add(label)

  return {
    object,
    animate: now => {
      object.geometry = new THREE.ParametricBufferGeometry(f(now / 200), 65, 65)
    }
  }
}

const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()

  // const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.1, 1000)
  const camera = new THREE.OrthographicCamera(
    canvas.clientWidth / -2,
    canvas.clientWidth / 2,
    canvas.clientWidth / 2,
    canvas.clientWidth / -2,
    0.1,
    1000
  )
  camera.zoom = 10
  camera.updateProjectionMatrix()
  camera.position.z = 65
  camera.position.x = 7
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
  const faceNormals = new THREE.FaceNormalsHelper(object, 2, 0x00ff00, 1)
  object.add(faceNormals)
  object.add(createAxes({ size: 12, fontSize: 2 }))
  scene.add(object)

  const xyGrid = new THREE.GridHelper(100, 20, 0x444444, 0x444444)
  const xzGrid = new THREE.GridHelper(100, 20, 0x444444, 0x444444)
  xzGrid.rotation.x = Math.PI / 2
  const zyGrid = new THREE.GridHelper(100, 20, 0x444444, 0x444444)
  zyGrid.rotation.z = Math.PI / 2
  scene.add(xyGrid)
  scene.add(xzGrid)
  scene.add(zyGrid)

  // const { object: graph1, animate: animateGraph1 } = createGraph(x => Math.sin(x), 'f(x) = sin(x)')
  // scene.add(graph1)
  // const { object: graph2, animate: animateGraph2 } = createGraph(x => Math.cos(x), 'f(x) = cos(x)')
  // scene.add(graph2)

  const { object: lineGraph, animate: animateLineGraph } = createLineGraph(
    t => x => 5 * Math.sin(x + t / 200),
    'f(x) = 5 * sin(x)',
    0x00ff00
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

  const objectState = state.select('object')
  let thenSecs = 0
  const animate = now => {
    if (!renderer) {
      return
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

const update = () =>
  didMount({
    canvas: document.querySelector('canvas'),
    container: document.querySelector('#container')
  })

const wrap = (Component, { ...first }) => ({ children, context, ...rest }) => (
  <Component {...first} {...rest}>
    {children}
  </Component>
)

const PointLightExample = () => {
  return (
    <div id="container">
      <Example notes={notes} components={{}} init={init} />
    </div>
  )
}

export default PointLightExample
