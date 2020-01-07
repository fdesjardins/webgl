import React from 'react'
import * as THREE from 'three'
import threeOrbitControls from 'three-orbit-controls'
import { css } from 'emotion'

import Example from '-/components/example'
import notes from './readme.md'
import SPH from '../graphing/elements/sph'

// const WHITE = 0xffffff
// const BLACK = 0x000000
//
// const setupCamera = ({ domain, margin }) => {
//   const width = domain[1] - domain[0]
//   const camera = new THREE.OrthographicCamera(
//     -width / 2 - margin[0],
//     width / 2 + margin[1],
//     width / 2 + margin[2],
//     -width / 2 - margin[3],
//     0.01,
//     1000
//   )
//   camera.updateProjectionMatrix()
//   camera.position.z = 50
//   return camera
// }
//
// export const addControls = ({ camera, renderer }) => {
//   const OrbitControls = threeOrbitControls(THREE)
//   const controls = new OrbitControls(camera, renderer.domElement)
//   controls.enableDamping = true
//   controls.update()
//   return controls
// }
//
// const config = {
//   scene: {
//     background: BLACK
//   },
//   simulation: {
//     domain: [-20, 20],
//     gridSize: 1
//   }
// }
//
// const init = () => {
//   const canvas = document.getElementById('sph')
//   let scene = new THREE.Scene()
//   scene.background = new THREE.Color(config.scene.background)
//   let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
//   renderer.setSize(canvas.clientWidth, canvas.clientWidth)
//
//   const { domain, gridSize } = config.simulation
//   const width = domain[1] - domain[0]
//   // left, right, top, bottom
//   const margin = [width / 10, width / 10, width / 10, width / 10]
//   const center = (domain[1] + domain[0]) / 2
//
//   const camera = setupCamera({ domain, margin })
//   const controls = addControls({ camera, renderer })
//   controls.target.set(center, center, 0)
//   controls.update()
//
//   const dt = 0.025
//
//   const animate = now => {
//     renderer.render(scene, camera)
//   }
//   animate()
//
//   return () => {
//     renderer.dispose()
//     scene.dispose()
//     scene = null
//     renderer = null
//   }
// }
//
// const SPH = () => {
//   React.useEffect(() => {
//     if (document.getElementById('sph')) {
//       return init()
//     }
//   })
//   return <canvas id="sph" />
// }

const style = css`
  canvas {
    max-width: 100%;
    border: 1px solid #eee;
  }
`

const E = () => (
  <div className={`${style}`}>
    <Example
      notes={notes}
      components={{
        SPH
      }}
    />
  </div>
)

export default E
