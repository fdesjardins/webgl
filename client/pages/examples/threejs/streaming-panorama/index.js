import React from 'react'
import { css } from 'emotion'
import * as THREE from 'three'
import threeOrbitControls from 'three-orbit-controls'

import droidSans from '-/assets/fonts/helvetiker_bold.typeface.json'

import Example from '-/components/example'
import notes from './readme.md'
import shader from './shader.glsl'

import image00 from './images/0-0.jpg'
import image01 from './images/0-1.jpg'
import image10 from './images/1-0.jpg'
import image11 from './images/1-1.jpg'
// import image0 from './0.jpg'
// import image11 from './1-1.jpg'
// import image12 from './1-2.jpg'
// import image13 from './1-3.jpg'
// import image14 from './1-4.jpg'
// import image2 from './2.jpg'
// import image3 from './3.jpg'
// import image4 from './4.jpg'
// import image5 from './5-crop.jpg'
// import image6 from './6.jpg'
// import image7 from './7.jpg'
// import pano from './panorama.jpg'

import Stats from 'stats.js'

const globals = {
  textureLoader: new THREE.TextureLoader(),
}

const loadTexture = (url) => {
  return new Promise((resolve, reject) => {
    globals.textureLoader.load(url, (tex) => {
      tex.minFilter = THREE.LinearFilter
      resolve(tex)
    })
  })
}

const Image00 = new THREE.TextureLoader().load(image00)
const Image01 = new THREE.TextureLoader().load(image01)
const Image10 = new THREE.TextureLoader().load(image10)
const Image11 = new THREE.TextureLoader().load(image11)
// let Image0 = new THREE.TextureLoader().load(image0)
// const Image11 = new THREE.TextureLoader().load(image11)
// const Image12 = new THREE.TextureLoader().load(image12)
// const Image13 = new THREE.TextureLoader().load(image13)
// const Image14 = new THREE.TextureLoader().load(image14)
// const Image2 = new THREE.TextureLoader().load(image2)
// const Image3 = new THREE.TextureLoader().load(image3)
// const Image4 = new THREE.TextureLoader().load(image4)
// const Image5 = new THREE.TextureLoader().load(image5)
// const Image6 = new THREE.TextureLoader().load(image6)
// const Image7 = new THREE.TextureLoader().load(image7)
// const Pano = new THREE.TextureLoader().load(pano)

Image00.minFilter = THREE.LinearFilter
Image01.minFilter = THREE.LinearFilter
Image10.minFilter = THREE.LinearFilter
Image11.minFilter = THREE.LinearFilter
// Image0.minFilter = THREE.LinearFilter
// Image11.minFilter = THREE.LinearFilter
// Image2.minFilter = THREE.LinearFilter
// Image3.minFilter = THREE.LinearFilter
// Image4.minFilter = THREE.LinearFilter
// Image5.minFilter = THREE.LinearFilter
// Image6.minFilter = THREE.LinearFilter
// Image7.minFilter = THREE.LinearFilter
// Pano.minFilter = THREE.LinearFilter

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

const fs = shader

const deg2rad = (deg) => (deg * Math.PI) / 180

const faceImage = (camera, imageNum) => {
  const x = 0.1 * Math.cos(deg2rad(-45 * (imageNum + 1))) * -1
  const z = 0.1 * Math.sin(deg2rad(-45 * (imageNum + 1)))
  camera.position.set(x, 0, z)
}

const init = ({ canvas, container }) => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(BLACK)

  const stats = new Stats()
  stats.showPanel(0)
  canvas.appendChild(stats.dom)

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    2000
  )
  camera.updateProjectionMatrix()

  const lookAtImage = 0
  switch (lookAtImage) {
    case 0:
      camera.position.set(-0.1, 0, -0.1)
      break
    case 1:
      camera.position.set(-0.1, 0, 0.1)
      break
    case 2:
      camera.position.set(0.1, 0, 0.1)
      break
    case 3:
      camera.position.set(0.1, 0, -0.1)
      break
  }

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

  const mkUniform = (name, value) => ({ [name]: { type: 'sampler2D', value } })
  const uniforms = {
    ...mkUniform('iChannel0', Image00),
    ...mkUniform('iChannel1', Image01),
    ...mkUniform('iChannel2', Image10),
    ...mkUniform('iChannel3', Image11),
    // ...mkUniform('iChannel4', Image4),
    // ...mkUniform('iChannel5', Image5),
    // ...mkUniform('iChannel6', Image6),
    // ...mkUniform('iChannel7', Image7),
    // ...mkUniform('iChannel8', Pano),
  }
  const mkImageNum = (value) => ({ imageNum: { type: 'int', value } })
  const mkObject = (imageNum) => {
    const material = new THREE.ShaderMaterial({
      fragmentShader: fs,
      vertexShader: vs,
      side: THREE.DoubleSide,
      uniforms: { ...uniforms, ...mkImageNum(imageNum) },
      transparent: true,
    })
    const materials = [
      material,
      new THREE.MeshBasicMaterial({ color: BLACK, transparent: true }),
      new THREE.MeshBasicMaterial({ color: BLACK, transparent: true }),
    ]
    const geometry = new THREE.CylinderBufferGeometry(25, 25, 23, 64)
    return new THREE.Mesh(geometry, materials)
  }

  // let mesh, mesh2, mesh7, mesh6, mesh5
  loadTexture(image00).then((tex) => {
    // Image0 = tex
    scene.add(mkObject(0))
    scene.add(mkObject(1))
    scene.add(mkObject(2))
    scene.add(mkObject(3))
    // scene.add(mkObject(4))
    // scene.add(mkObject(5))
    // scene.add(mkObject(6))
    // scene.add(mkObject(7))
  })

  const fontLoader = new THREE.FontLoader()
  const font = fontLoader.parse(droidSans)
  const fontSize = 0.15
  const lazyMountain = new THREE.Mesh(
    new THREE.TextGeometry('Lazy Mountain\n     7.8 km', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3,
    }),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  )
  lazyMountain.position.set(4.2, 2.5, -10)
  scene.add(lazyMountain)

  const matanuskaPeak = new THREE.Mesh(
    new THREE.TextGeometry('Matanuska Peak\n        11 km', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3,
    }),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  )
  matanuskaPeak.position.set(9.25, 3.3, -10)
  scene.add(matanuskaPeak)

  const pioneerPeak = new THREE.Mesh(
    new THREE.TextGeometry('Pioneer Peak\n      13 km', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3,
    }),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  )
  pioneerPeak.position.set(8, 2.5, 7.25)
  scene.add(pioneerPeak)

  const directionText = new THREE.Mesh(
    new THREE.TextGeometry('Direction', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3,
    }),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  )
  // scene.add(directionText)
  directionText.position.set(0, 0, -1)

  // Rotate through the sample images if we're pointed at the last octant
  // const images = [image11, image12, image13, image14]
  // let imageIndex = 1
  // const raycaster = new THREE.Raycaster()
  // setInterval(() => {
  //   raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
  //   const intersections = raycaster.intersectObjects([mesh])
  //   if (!intersections || intersections.length === 0) {
  //     return
  //   }
  //   if (intersections[0].uv.x >= 0.875 && intersections[0].uv.x <= 1.0) {
  //     loadTexture(images[imageIndex++]).then((texture) => {
  //       const oldTexture = uniforms.iChannel1.value
  //       uniforms.iChannel1.value = texture
  //       oldTexture.dispose()
  //     })
  //     if (imageIndex === 4) {
  //       imageIndex = 0
  //     }
  //   }
  // }, 2000)

  const animate = () => {
    if (renderer) {
      stats.begin()
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      lazyMountain.lookAt(camera.position)
      matanuskaPeak.lookAt(camera.position)
      pioneerPeak.lookAt(camera.position)
      stats.end()
    }
  }
  animate()

  return () => {
    renderer.dispose()
    stats.scene = null
    renderer = null
  }
}

const E = () => (
  <div className={`${style}`}>
    <Example notes={notes} init={init} />
  </div>
)

export default E
