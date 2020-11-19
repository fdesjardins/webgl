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

const Image0 = new THREE.TextureLoader().load(image0)
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

Image0.minFilter = THREE.NearestFilter
Image11.minFilter = THREE.NearestFilter
Image2.minFilter = THREE.NearestFilter
Image3.minFilter = THREE.NearestFilter
Image4.minFilter = THREE.NearestFilter
Image5.minFilter = THREE.NearestFilter
Image6.minFilter = THREE.NearestFilter
Image7.minFilter = THREE.NearestFilter

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

void main(){
  float vfov = 0.75;
  gl_FragColor = vec4(0.0);

  if (vUv.x <= 0.125) {
    vec2 uvMinMax = vec2(0.1, 0.912);
    float shift = uvMinMax.x;
    float s = 8.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel0,
      vec2(
        clamp(1.0 - (vUv.x * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
    gl_FragColor *= 1.3;
  } else if (vUv.x <= 0.25) {
    vec2 uvMinMax = vec2(0.088, 0.95);
    float shift = uvMinMax.x;
    float s = 8.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel7,
      vec2(
        clamp(1.0 - ((vUv.x - 0.125) * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
  } else if (vUv.x <= 0.375) {
    vec2 uvMinMax = vec2(0.2, 0.9);
    float shift = uvMinMax.x;
    float s = 8.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel6,
      vec2(
        clamp(1.0 - ((vUv.x - 0.25) * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
  } else if (vUv.x <= 0.5) {
    vec2 uvMinMax = vec2(0.15, 0.95);
    float shift = uvMinMax.x;
    float s = 8.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel5,
      vec2(
        clamp(1.0 - ((vUv.x - 0.375) * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
  } else if (vUv.x <= 0.625) {
    vec2 uvMinMax = vec2(0.227, 0.975);
    float shift = uvMinMax.x;
    float s = 8.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel4,
      vec2(
        clamp(1.0 - ((vUv.x - 0.5) * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
  } else if (vUv.x <= 0.75) {
    vec2 uvMinMax = vec2(0.227, 0.925);
    float shift = uvMinMax.x;
    float s = 8.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel3,
      vec2(
        clamp(1.0 - ((vUv.x - 0.625) * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
    gl_FragColor *= 1.2;
  } else if (vUv.x <= 0.875) {
    vec2 uvMinMax = vec2(0.2, 0.9);
    float shift = uvMinMax.x;
    float s = 8.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel2,
      vec2(
        clamp(1.0 - ((vUv.x - 0.75) * s + shift), 0.0, 1.0),
        vUv.y
      )
    );
    gl_FragColor *= 1.2;
  } else {
    vec2 uvMinMax = vec2(0.125, 0.85);
    float shift = uvMinMax.x;
    float s = 8.0 * (uvMinMax.y - uvMinMax.x);
    gl_FragColor = texture(iChannel1,
      vec2(
        clamp(1.0 - ((vUv.x - 0.875) * s + shift), 0.0, 1.0),
        vUv.y
      )
    );

  }

  // if (vUv.y < 0.01 || vUv.y > 0.99) {
  //   gl_FragColor = vec4(0.0);
  // }
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
  camera.position.set(1, 0, -1)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enableZoom = false
  controls.rotateSpeed = (-1 * camera.fov) / 1250 // -0.06
  controls.update()

  const onWheel = (delta) => {
    const fov = camera.fov + delta * 0.1
    camera.fov = THREE.MathUtils.clamp(fov, 5, 90)
    controls.rotateSpeed = (-1 * camera.fov) / 1250
    camera.updateProjectionMatrix()
  }
  canvas.addEventListener('wheel', (e) => onWheel(e.deltaY))

  const ambientLight = new THREE.AmbientLight(0x444444)
  scene.add(ambientLight)

  renderer.setSize(container.clientWidth, container.clientWidth)

  const image1Uniform = {
    type: 'sampler2D',
    value: Image11,
  }

  const geometry = new THREE.CylinderBufferGeometry(25, 25, 23, 64)
  // const material = new THREE.MeshPhongMaterial({ color: WHITE })
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
  const mesh = new THREE.Mesh(geometry, materials)
  scene.add(mesh)

  const images = [image11, image12, image13, image14]
  let imageIndex = 1
  const loader = new THREE.TextureLoader()
  const raycaster = new THREE.Raycaster()

  setInterval(() => {
    raycaster.setFromCamera(new THREE.Vector2(0.5, 0.5), camera)
    const intersections = raycaster.intersectObjects([mesh])
    // console.log(intersections)
    if (intersections[0].uv.x >= 0.825 && intersections[0].uv.x <= 1.0) {
      loader.load(images[imageIndex++], (texture) => {
        texture.minFilter = THREE.NearestFilter
        const oldTexture = image1Uniform.value
        image1Uniform.value = texture
        oldTexture.dispose()
      })
      if (imageIndex === 4) {
        imageIndex = 0
      }
    }
  }, 1000)

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
