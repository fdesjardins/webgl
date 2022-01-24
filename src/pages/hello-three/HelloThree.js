import React from 'react'
import * as THREE from 'three'

// import Example from '-/components/example'
// import notes from './readme.md'

const init = ({ canvas, container }) => {
  let renderer = new THREE.WebGLRenderer({ canvas })
  let scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )
  camera.position.z = 3

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshLambertMaterial({ color: 0xaaff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 3, 5)
  scene.add(light)

  const animate = () => {
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
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

const HelloThree = () => {
  React.useEffect(() => {
    const canvas = document.querySelector('canvas')
    const container = document.querySelector('#container')
    if (init) {
      const dispose = init({ canvas, container })
      return () => {
        if (typeof dispose === 'function') {
          dispose()
        }
      }
    }
  })
  // const Controls = () => (
  //   <UpDownLeftRight
  //     onLeft={() => state.select(['pos', 'x']).apply((x) => x - 50)}
  //     onRight={() => state.select(['pos', 'x']).apply((x) => x + 50)}
  //     onUp={() => state.select(['pos', 'y']).apply((x) => x - 50)}
  //     onDown={() => state.select(['pos', 'y']).apply((x) => x + 50)}
  //   />
  // )
  // const components = {
  //   Controls,
  // }
  return (
    <>
      <div id="container">
        <canvas />
      </div>
    </>
  )
}

export default React.memo(HelloThree)
