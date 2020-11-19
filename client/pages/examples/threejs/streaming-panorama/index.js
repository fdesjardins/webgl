import React from 'react'
import { css } from 'emotion'
import * as THREE from 'three'
import threeOrbitControls from 'three-orbit-controls'

import Example from '-/components/example'
import notes from './readme.md'

import image0 from './0.jpg'
import image11 from './1-1.jpg'
import image12 from './1-2.jpg'
import image13 from './1-3.jpg'
import image14 from './1-4.jpg'
import image2 from './2.jpg'
import image3 from './3.jpg'
import image4 from './4.jpg'
import image5 from './5.jpg'
import image6 from './6.jpg'
import image7 from './7.jpg'

import Stats from 'stats.js'

const loader = new THREE.TextureLoader()

const loadTexture = (url) => {
  return new Promise((resolve, reject) => {
    loader.load(url, (tex) => {
      tex.minFilter = THREE.LinearFilter
      resolve(tex)
    })
  })
}

let Image0

const Image11 = new THREE.TextureLoader().load(image11)
const Image12 = new THREE.TextureLoader().load(image12)
const Image13 = new THREE.TextureLoader().load(image13)
const Image14 = new THREE.TextureLoader().load(image14)
const Image2 = new THREE.TextureLoader().load(image2)
const Image3 = new THREE.TextureLoader().load(image3)
const Image4 = new THREE.TextureLoader().load(image4)
const Image5 = new THREE.TextureLoader().load(image5)
const Image6 = new THREE.TextureLoader().load(image6)
const Image7 = new THREE.TextureLoader().load(image7)

// Image0.minFilter = THREE.LinearFilter
Image11.minFilter = THREE.LinearFilter
Image2.minFilter = THREE.LinearFilter
Image3.minFilter = THREE.LinearFilter
Image4.minFilter = THREE.LinearFilter
Image5.minFilter = THREE.LinearFilter
Image6.minFilter = THREE.LinearFilter
Image7.minFilter = THREE.LinearFilter

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
uniform sampler2D iChannel4;
uniform sampler2D iChannel5;
uniform sampler2D iChannel6;
uniform sampler2D iChannel7;

mat2 rotate2d(float theta){
  return mat2(cos(theta), -sin(theta),
              sin(theta),  cos(theta));
}

mat2 scale(float sx, float sy){
  return mat2(1.0/sx, 0.0,
              0.0,    1.0/sy);
}

vec4 map(int channel, vec2 uv){
  vec4 res = vec4(0.0);
  switch (channel) {
  case 0: res = texture(iChannel0, uv); break;
  case 1: res = texture(iChannel1, uv); break;
  case 2: res = texture(iChannel2, uv); break;
  case 3: res = texture(iChannel3, uv); break;
  case 4: res = texture(iChannel4, uv); break;
  case 5: res = texture(iChannel5, uv); break;
  case 6: res = texture(iChannel6, uv); break;
  case 7: res = texture(iChannel7, uv); break;
  }
  return res;
}

void main(){
  float vfov = 0.75;
  vec2 uv = vUv;
  int channel;
  float lighten = 1.0;

  if (vUv.x <= 0.125) {
    channel = 0;
    uv.x = 1.0 - uv.x * 8.0;
    lighten = 1.3;
    uv *= rotate2d(-0.01);
    uv *= scale(1.35, 1.0);
    uv.x += 0.09;
  } else if (vUv.x <= 0.25) {
    channel = 7;
    uv.x = 1.0 - (uv.x - 0.125) * 8.0;
    uv *= rotate2d(0.017);
    uv *= scale(1.29, 1.0);
    uv.x += 0.125;
  } else if (vUv.x <= 0.375) {
    channel = 6;
    uv.x = 1.0 - (uv.x - 0.25) * 8.0;
    uv *= rotate2d(0.015);
    uv *= scale(1.28, 1.0);
    uv.y += 0.03;
    uv.x += 0.12;
  } else if (vUv.x <= 0.5) {
    channel = 5;
    uv.x = 1.0 - (uv.x - 0.375) * 8.0;
    uv *= rotate2d(0.013);
    uv *= scale(1.35, 1.0);
    uv.x += 0.09;
    uv.y += 0.01;
  } else if (vUv.x <= 0.625) {
    channel = 4;
    uv.x = 1.0 - (uv.x - 0.5) * 8.0;
    uv *= rotate2d(0.005);
    uv *= scale(1.38, 1.0);
    uv.x += 0.08;
  } else if (vUv.x <= 0.75) {
    channel = 3;
    uv.x = 1.0 - (uv.x - 0.625) * 8.0;
    uv *= scale(1.35, 1.0);
    uv *= rotate2d(0.0);
    uv.x += 0.1;
    lighten *= 1.2;
  } else if (vUv.x <= 0.875) {
    channel = 2;
    uv.x = 1.0 - (uv.x - 0.75) * 8.0;
    uv *= rotate2d(0.01);
    uv *= scale(1.35, 1.0);
    uv.x += 0.095;
    uv.y += 0.012;
    lighten *= 1.2;
  } else {
    channel = 1;
    uv.x = 1.0 - (uv.x - 0.875) * 8.0;
    uv *= rotate2d(-0.005);
    uv *= scale(1.35, 1.0);
    uv.x += 0.09;
    uv.y += 0.01;
    lighten = 1.1;
  }

  // Set the color to black instead of allowing the texture to repeat
  if (uv.y < 0.0 || uv.y > 1.0 || uv.x < 0.0 || uv.x > 1.0) {
    gl_FragColor = vec4(0.0);
  } else {
    gl_FragColor = map(channel, uv) * lighten;
  }

  // Chop a little off the top and bottom for a clean edge
  if (vUv.y < 0.025 || vUv.y > 0.96) {
    gl_FragColor = vec4(0.0);
  }
}
`

const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(BLACK)

  const stats = new Stats()
  stats.showPanel(0)
  document.body.appendChild(stats.dom)

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    2000
  )
  camera.updateProjectionMatrix()
  camera.position.set(0.01, 0, 0)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enableZoom = false
  controls.rotateSpeed = (-1 * camera.fov) / 800
  controls.update()

  const onWheel = (delta) => {
    const fov = camera.fov + delta * 0.1
    camera.fov = THREE.MathUtils.clamp(fov, 5, 90)
    controls.rotateSpeed = (-1 * camera.fov) / 800
    camera.updateProjectionMatrix()
  }
  canvas.addEventListener('wheel', (e) => onWheel(e.deltaY))

  const ambientLight = new THREE.AmbientLight(0x444444)
  scene.add(ambientLight)

  const onResize = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
    if (renderer) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    }
    renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  }
  window.addEventListener('resize', onResize, false)
  onResize()

  const image1Uniform = {
    type: 'sampler2D',
    value: Image11,
  }

  let mesh
  const geometry = new THREE.CylinderBufferGeometry(25, 25, 23, 64)
  // const material = new THREE.MeshPhongMaterial({ color: WHITE })
  loadTexture(image0).then((tex) => {
    Image0 = tex
    const material = new THREE.ShaderMaterial({
      fragmentShader: fs,
      vertexShader: vs,
      side: THREE.DoubleSide,
      uniforms: {
        iChannel0: {
          type: 'sampler2D',
          value: Image0,
        },
        iChannel1: image1Uniform,
        iChannel2: {
          type: 'sampler2D',
          value: Image2,
        },
        iChannel3: {
          type: 'sampler2D',
          value: Image3,
        },
        iChannel4: {
          type: 'sampler2D',
          value: Image4,
        },
        iChannel5: {
          type: 'sampler2D',
          value: Image5,
        },
        iChannel6: {
          type: 'sampler2D',
          value: Image6,
        },
        iChannel7: {
          type: 'sampler2D',
          value: Image7,
        },
      },
    })
    const materials = [
      material,
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    ]
    mesh = new THREE.Mesh(geometry, materials)
    scene.add(mesh)
  })

  // Rotate through the sample images if we're pointed at the last octant
  const images = [image11, image12, image13, image14]
  let imageIndex = 1
  const raycaster = new THREE.Raycaster()
  setInterval(() => {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
    const intersections = raycaster.intersectObjects([mesh])
    if (intersections.length === 0) {
      return
    }
    if (intersections[0].uv.x >= 0.875 && intersections[0].uv.x <= 1.0) {
      loadTexture(images[imageIndex++]).then((texture) => {
        const oldTexture = image1Uniform.value
        image1Uniform.value = texture
        oldTexture.dispose()
      })
      if (imageIndex === 4) {
        imageIndex = 0
      }
    }
  }, 2000)

  const animate = () => {
    if (renderer) {
      stats.begin()
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      stats.end()
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
