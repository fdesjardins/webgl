import React from 'react'
import * as THREE from 'three'
import Baobab from 'baobab'

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
      y: 0.005,
      z: 0.0
    }
  },
  board: {
    size: {
      w: 10,
      h: 10
    }
  }
})

const vs = `
varying vec2 texCoord;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);

  texCoord = vec2(gl_Position.x, gl_Position.y);
}`

const fs1 = `
varying vec2 texCoord;
void main(){
  vec2 coord = vec2(gl_FragCoord);

  if (
    mod( floor(texCoord.x) + floor(texCoord.y), 2.0 ) == 0.0) {
    gl_FragColor = vec4(1.);
  } else {
    gl_FragColor = vec4(0.);
  }
}`

const fs = `
uniform sampler2D texture;
varying vec2 vUv;

void edgeKernel(inout float kernel[9]){
  kernel[0] = 0.0;
  kernel[1] = -1.0;
  kernel[2] = 0.0;
  kernel[3] = -1.0;
  kernel[4] = 4.0;
  kernel[5] = -1.0;
  kernel[6] = 0.0;
  kernel[7] = -1.0;
  kernel[8] = 0.0;
}

void gaussianKernel(inout float k[9]){
  k[0] = 1.0 / 16.0;  k[1] = 1.0 / 8.0;  k[2] = 1.0 / 16.0;
  k[3] = 1.0 / 8.0;   k[4] = 1.0 / 4.0;  k[5] = 1.0 / 8.0;
  k[6] = 1.0 / 16.0;  k[7] = 1.0 / 8.0;  k[8] = 1.0 / 16.0;
}

void passthrough(inout float k[9]){
  k[0] = 0.0;  k[1] = 0.0;  k[2] = 0.0;
  k[3] = 0.0;  k[4] = 1.0;  k[5] = 0.0;
  k[6] = 0.0;  k[7] = 0.0;  k[8] = 0.0;
}

void gameOfLifeKernel(inout float k[9]){
  k[0] = 1.0;  k[1] = 1.0;  k[2] = 1.0;
  k[3] = 1.0;  k[4] = 0.0;  k[5] = 1.0;
  k[6] = 1.0;  k[7] = 1.0;  k[8] = 1.0;
}

vec4 convolve(float kernel[9], vec2 stepSize){
  vec4 sum = vec4(0.0);
  sum += texture2D(texture, vec2(vUv.x - stepSize.x, vUv.y - stepSize.y)) * kernel[0];
  sum += texture2D(texture, vec2(vUv.x,              vUv.y - stepSize.y)) * kernel[1];
  sum += texture2D(texture, vec2(vUv.x + stepSize.x, vUv.y - stepSize.y)) * kernel[2];

  sum += texture2D(texture, vec2(vUv.x - stepSize.x, vUv.y)) * kernel[3];
  sum += texture2D(texture, vec2(vUv.x,              vUv.y)) * kernel[4];
  sum += texture2D(texture, vec2(vUv.x + stepSize.x, vUv.y)) * kernel[5];

  sum += texture2D(texture, vec2(vUv.x - stepSize.x, vUv.y + stepSize.y)) * kernel[6];
  sum += texture2D(texture, vec2(vUv.x,              vUv.y + stepSize.y)) * kernel[7];
  sum += texture2D(texture, vec2(vUv.x + stepSize.x, vUv.y + stepSize.y)) * kernel[8];
  return sum;
}

void main(){
  float kernel[9];
  // edgeKernel(kernel);
  // passthrough(kernel);
  // gameOfLifeKernel(kernel);
  // gaussianKernel(kernel);
  vec2 stepSize = 1.0 / vec2(10.0, 10.0);
  vec4 sum = convolve(kernel, stepSize);

  // gl_FragColor = texture2D(texture, vUv);
  gl_FragColor = sum;
}`

const fs2 = `
varying vec2 vUv;
const int MAXSTEPS = 150;
uniform float iTime;

vec3 mandelbrot(vec2 c){
  vec2 z = c;
  for (int i = 0; i < MAXSTEPS; i += 1) {
    float x = (z.x * z.x - z.y * z.y) + c.x;
    float y = (z.y * z.x + z.x * z.y) + c.y;
    if ((x*x + y*y) > 4.0) {
      return vec3(0.0, 1.0 * float(i) / float(MAXSTEPS), 1.0 / float(MAXSTEPS) * float(i));
    }
    z.x = x;
    z.y = y;
  }
  return vec3(0.0, 0.0, 0.0);
}

void main(){
  float zoom = 5.0 - (sin(iTime) + 1.0) * 2.4999;
  float yoff = zoom / 2.0;
  float xoff = zoom / 2.0 + 1.5;
  vec3 color = mandelbrot(vec2(vUv.x * zoom - xoff, vUv.y * zoom - yoff));
  gl_FragColor = vec4(color, 1.0);
}
`

const texture = () => {
  const width = 10
  const height = 10
  const data = new Uint8Array(3 * width * height)
  for (let i = 0; i < width * height * 3; i++) {
    const stride = i * 3
    data[stride] = 0
    data[stride + 1] = 0
    data[stride + 2] = 0
    if (stride === 162) {
      data[stride] = 255
      data[stride + 1] = 255
      data[stride + 2] = 255
    }
  }
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBFormat)
  tex.needsUpdate = true
  return tex
}

const rtScene = () => {
  const width = 512
  const height = 512
  const renderTarget = new THREE.WebGLRenderTarget(width, height)
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.001, 1000)
  camera.position.z = 3
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xff0000)
  const light = new THREE.PointLight(0xffffff, 1, 100)
  scene.add(light)

  return {
    renderTarget,
    scene,
    camera
  }
}

const didMount = ({ canvas, container }) => {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.1, 1000)
  camera.position.z = 75

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera)
  controls.update()

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)
  scene.background = new THREE.Color(0xffffff)

  const light = new THREE.PointLight(0x00ff00, 2, 100)
  light.position.set(0, 20, 30)
  light.castShadow = true
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 500
  scene.add(light)

  const planeGeometry = new THREE.PlaneBufferGeometry(200, 200, 200, 200)
  const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -Math.PI / 2
  plane.position.z = 1
  plane.position.y = -50
  plane.receiveShadow = true
  scene.add(plane)

  const { renderTarget, scene: renderTargetScene, camera: renderTargetCamera } = rtScene()

  const geometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100)
  const uTexture = {
    type: 't',
    value: texture()
  }
  const iTime = {
    type: 'f',
    value: 1.5 * Math.PI
  }
  const material = new THREE.ShaderMaterial({
    vertexShader: vs,
    fragmentShader: fs2,
    side: THREE.DoubleSide,
    uniforms: {
      texture: uTexture,
      iTime: iTime
    }
  })
  const object = new THREE.Mesh(geometry, material)
  object.position.z = 0.0
  object.receiveShadow = true
  object.castShadow = true
  scene.add(object)

  let then = 0
  const animate = now => {
    requestAnimationFrame(animate)
    const nowSecs = now * 0.001
    const deltaSecs = nowSecs - then
    then = nowSecs

    iTime.value += 0.0025

    controls.update()

    // renderer.setRenderTarget(renderTarget)
    // renderer.render(renderTargetScene, renderTargetCamera)
    // renderer.setRenderTarget(null)

    // uTexture.value = renderTarget.texture

    renderer.render(scene, camera)
  }
  animate()
}

const update = () =>
  didMount({
    canvas: document.querySelector('canvas'),
    container: document.querySelector('#container')
  })

const PointLightExample = () => (
  <div id="container">
    <Example notes={notes} didMount={update} didUpdate={update} />
  </div>
)

export default PointLightExample
