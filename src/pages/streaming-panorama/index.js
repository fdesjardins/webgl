import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import vs from './vs.glsl'
import fs from './fs.glsl'

import image00 from './images/0-0.jpg'
import image01 from './images/0-1.jpg'
import image10 from './images/1-0.jpg'
import image11 from './images/1-1.jpg'

export const meta = {
  tags: 'threejs',
  title: 'Streaming Panorama Shader',
  slug: 'streaming-panorama',
}

export const options = {
  display: 'fullscreen',
}

const loadTexture = (url, textureLoader) => {
  return new Promise((resolve) => {
    textureLoader.load(url, (tex) => {
      tex.minFilter = THREE.LinearFilter
      resolve(tex)
    })
  })
}

export const init = ({ canvas }) => {
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    2000
  )
  camera.updateProjectionMatrix()
  camera.position.set(0.01, 0, 0)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false
  controls.rotateSpeed = (-1 * camera.fov) / 400
  controls.update()

  const onWheel = (delta) => {
    const fov = camera.fov + delta * 0.1
    camera.fov = THREE.MathUtils.clamp(fov, 5, 90)
    controls.rotateSpeed = (-1 * camera.fov) / 400
    camera.updateProjectionMatrix()
  }
  canvas.addEventListener('wheel', (e) => onWheel(e.deltaY))

  const handleResize = (event) => {
    if (event) {
      event.preventDefault()
    }
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  }
  window.addEventListener('resize', handleResize, false)
  handleResize()

  const textureLoader = new THREE.TextureLoader()
  const Image00 = textureLoader.load(image00)
  const Image01 = textureLoader.load(image01)
  const Image10 = textureLoader.load(image10)
  const Image11 = textureLoader.load(image11)
  Image00.minFilter = THREE.LinearFilter
  Image01.minFilter = THREE.LinearFilter
  Image10.minFilter = THREE.LinearFilter
  Image11.minFilter = THREE.LinearFilter

  const mkUniform = (name, value) => ({ [name]: { type: 'sampler2D', value } })
  const uniforms = {
    ...mkUniform('iChannel0', Image00),
    ...mkUniform('iChannel1', Image01),
    ...mkUniform('iChannel2', Image10),
    ...mkUniform('iChannel3', Image11),
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
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true }),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true }),
    ]
    const geometry = new THREE.CylinderGeometry(25, 25, 23, 64)
    return new THREE.Mesh(geometry, materials)
  }

  loadTexture(image00, textureLoader).then(() => {
    scene.add(mkObject(0))
    scene.add(mkObject(1))
    scene.add(mkObject(2))
    scene.add(mkObject(3))
  })

  const animate = () => {
    if (!renderer) {
      return
    }
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    controls.update()
  }
  animate()

  return () => {
    renderer.dispose()
    controls.dispose()
    scene = null
    renderer = null
    window.removeEventListener('resize', handleResize)
  }
}
