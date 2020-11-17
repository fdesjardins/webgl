import React from 'react'
import { css } from 'emotion'
import * as THREE from 'three'
import threeOrbitControls from 'three-orbit-controls'

import Example from '-/components/example'
import notes from './readme.md'

import ZeroLeftImage from './0-left.jpg'
import ZeroRightImage from './0-right.jpg'
import OneLeftImage from './1-left.jpg'
import OneRightImage from './1-right.jpg'

const ZeroLeft = new THREE.TextureLoader().load(ZeroLeftImage)
const ZeroRight = new THREE.TextureLoader().load(ZeroRightImage)
const OneLeft = new THREE.TextureLoader().load(OneLeftImage)
const OneRight = new THREE.TextureLoader().load(OneRightImage)

const WHITE = 0xffffff
const BLACK = 0x000000

const style = css`
  canvas {
    position: fixed;
    top: 68px;
    left: 0px;
    width: 100vw;
    height: calc(100vh - 68px) !important;
  }
`

const vs = `
varying vec2 texCoord;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
  texCoord = vec2(gl_Position.x, gl_Position.y);
}`

const fs = `
varying vec2 texCoord;
varying vec2 vUv;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;

void main(){
  float vfov = 0.75;

  if (vUv.x <= 0.25) {
    vec2 uvMinMax = vec2(0.1, 0.9);
    float shift = uvMinMax.x;
    float s = 4.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel0,
      vec2(
        clamp(1.0 - (vUv.x * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
  } else if (vUv.x <= 0.5) {
    vec2 uvMinMax = vec2(0.15, 0.85);
    float shift = uvMinMax.x;
    float s = 4.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel3,
      vec2(
        clamp(1.0 - ((vUv.x - 0.25) * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
  } else if (vUv.x <= 0.75) {
    vec2 uvMinMax = vec2(0.1, 0.875);
    float shift = uvMinMax.x;
    float s = 4.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel2,
      vec2(
        clamp(1.0 - ((vUv.x - 0.5) * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
  } else {
    vec2 uvMinMax = vec2(0.075, 0.875);
    float shift = uvMinMax.x;
    float s = 4.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel1,
      vec2(
        clamp(1.0 - ((vUv.x - 0.75) * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
  }

  if (vUv.y < 0.225 || vUv.y > 0.775) {
    gl_FragColor = vec4(0.0);
  }
}
`

const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(BLACK)

  const camera = new THREE.PerspectiveCamera(
    90,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    2000
  )
  camera.updateProjectionMatrix()
  camera.position.set(0.1, 0, 0)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enableZoom = false
  controls.rotateSpeed = 0.35
  controls.update()

  const onWheel = (delta) => {
    const fov = camera.fov + delta * 0.1
    camera.fov = THREE.MathUtils.clamp(fov, 10, 110)
    camera.updateProjectionMatrix()
  }
  canvas.addEventListener('wheel', (e) => onWheel(e.deltaY))

  const ambientLight = new THREE.AmbientLight(0x444444)
  scene.add(ambientLight)

  renderer.setSize(container.clientWidth, container.clientWidth)

  const geometry = new THREE.SphereBufferGeometry(10, 32, 32)
  // const material = new THREE.MeshPhongMaterial({ color: WHITE })
  const material = new THREE.ShaderMaterial({
    fragmentShader: fs,
    vertexShader: vs,
    side: THREE.DoubleSide,
    uniforms: {
      iChannel0: {
        type: 'sampler2D',
        value: ZeroLeft,
      },
      iChannel1: {
        type: 'sampler2D',
        value: ZeroRight,
      },
      iChannel2: {
        type: 'sampler2D',
        value: OneLeft,
      },
      iChannel3: {
        type: 'sampler2D',
        value: OneRight,
      },
    },
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const animate = () => {
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

const E = () => (
  <div className={`${style}`}>
    <Example notes={notes} init={init} />
  </div>
)

export default E
