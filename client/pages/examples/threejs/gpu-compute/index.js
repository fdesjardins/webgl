import React from 'react'
import { css } from 'emotion'
import * as THREE from 'three'
import threeOrbitControls from 'three-orbit-controls'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'

import { wrapComponent } from '-/utils'
import Example from '-/components/example'
import notes from './readme.md'

const WHITE = 0xffffff
const BLACK = 0x000000

const style = css`
  canvas {
    max-width: 100%;
    border: 1px solid #eee;
  }
  .input {
    margin-right: 10px;
  }
`

const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(BLACK)

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    2000
  )
  camera.updateProjectionMatrix()
  camera.position.set(5, 0, 0)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  renderer.gammaOutput = true

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.update()

  const ambientLight = new THREE.AmbientLight(0x444444)
  scene.add(ambientLight)
  const pointLight = new THREE.PointLight(WHITE)
  pointLight.position.set(20, 20, -20)
  scene.add(pointLight)

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshPhongMaterial({ color: WHITE })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const fsPosition = `

  `

  /**
   * GPU Compute
   */
  const gpuCompute = new GPUComputationRenderer(512, 512, renderer)
  const positionBuffer = gpuCompute.createTexture()
  const positionVar = gpuCompute.addVariable(
    'texturePosition',
    fsPosition,
    positionBuffer
  )
  // const gpuCompute.setVariableDependencies(positionVar)
  positionVar.material.uniforms.time = { value: 0.0 }

  const error = gpuCompute.init()
  if (error) {
    console.log(error)
  }

  let logIndex = 0
  const animate = () => {
    gpuCompute.compute()
    const uniforms = gpuCompute.getCurrentRenderTarget(positionVar).texture
    if (logIndex++ % 50 === 0) {
      console.log(uniforms)
    }

    if (renderer) {
      requestAnimationFrame(animate)
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

const E = () => (
  <div className={`${style}`}>
    <Example notes={notes} init={init} />
  </div>
)

export default E
