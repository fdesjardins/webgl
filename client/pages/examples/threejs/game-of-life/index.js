import React from 'react'
import * as THREE from 'three'

import Example from '-/components/example'
import notes from './readme.md'
import threeOrbitControls from 'three-orbit-controls'

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

const width = 4096
const height = 4096

const fs = `
uniform float iTime;
uniform sampler2D u_texture;
varying vec2 vUv;

void edgeKernel(inout float k[9]){
  k[0] = 0.0;   k[1] = -1.0;  k[2] = 0.0;
  k[3] = -1.0;  k[4] = 4.0;   k[5] = -1.0;
  k[6] = 0.0;   k[7] = -1.0;  k[8] = 0.0;
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
  sum += texture2D(u_texture, vec2(vUv.x - stepSize.x, vUv.y - stepSize.y)) * kernel[0];
  sum += texture2D(u_texture, vec2(vUv.x,              vUv.y - stepSize.y)) * kernel[1];
  sum += texture2D(u_texture, vec2(vUv.x + stepSize.x, vUv.y - stepSize.y)) * kernel[2];

  sum += texture2D(u_texture, vec2(vUv.x - stepSize.x, vUv.y)) * kernel[3];
  sum += texture2D(u_texture, vec2(vUv.x,              vUv.y)) * kernel[4];
  sum += texture2D(u_texture, vec2(vUv.x + stepSize.x, vUv.y)) * kernel[5];

  sum += texture2D(u_texture, vec2(vUv.x - stepSize.x, vUv.y + stepSize.y)) * kernel[6];
  sum += texture2D(u_texture, vec2(vUv.x,              vUv.y + stepSize.y)) * kernel[7];
  sum += texture2D(u_texture, vec2(vUv.x + stepSize.x, vUv.y + stepSize.y)) * kernel[8];
  return sum;
}

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898, 78.233))) * 43758.5453);
}

void main(){
  float kernel[9];
  // edgeKernel(kernel);
  passthrough(kernel);
  gameOfLifeKernel(kernel);
  // gaussianKernel(kernel);
  vec2 stepSize = 1.0 / vec2(${width}.0, ${height}.0);
  vec4 sum = convolve(kernel, stepSize);

  // gl_FragColor = texture2D(texture, vUv);
  // gl_FragColor = sum;

  if (sum.x == 3.0) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  } else if (sum.x == 2.0) {
    vec4 current = texture2D(u_texture, vec2(vUv.x, vUv.y));
    gl_FragColor = current;
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
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

const set = (data, i) => {
  data[i * 3] = 255
  data[i * 3 + 1] = 255
  data[i * 3 + 2] = 255
}

const addGlider = (data, col, row) => {
  set(data, col + row * width)
  set(data, col + (row - 1) * width + 1)
  set(data, col + (row - 2) * width - 1)
  set(data, col + (row - 2) * width)
  set(data, col + (row - 2) * width + 1)
}

const addBlinker = (data, col, row) => {
  set(data, col + row * width)
  set(data, col + (row + 1) * width)
  set(data, col + (row + 2) * width)
}

const addToad = (data, col, row) => {
  set(data, col + row * width)
  set(data, col + 1 + row * width)
  set(data, col + 2 + row * width)
  set(data, col - 1 + (row - 1) * width)
  set(data, col + (row - 1) * width)
  set(data, col + 1 + (row - 1) * width)
}

const addBlock = (data, col, row) => {
  set(data, col + row * width)
  set(data, col + 1 + row * width)
  set(data, col + (row - 1) * width)
  set(data, col + 1 + (row - 1) * width)
}

const addBeacon = (data, x, y) => {
  addBlock(data, x, y)
  addBlock(data, x + 2, y - 2)
}

const addRPentamino = (data, col, row) => {
  set(data, col + row * width)
  set(data, col + 1 + row * width)
  set(data, col - 1 + (row - 1) * width)
  set(data, col + (row - 1) * width)
  set(data, col + (row - 2) * width)
}

const addAcorn = (data, col, row) => {
  set(data, col + 1 + row * width)
  set(data, col + 3 + (row - 1) * width)
  set(data, col + (row - 2) * width)
  set(data, col + 1 + (row - 2) * width)
  set(data, col + 4 + (row - 2) * width)
  set(data, col + 5 + (row - 2) * width)
  set(data, col + 6 + (row - 2) * width)
}

const texture = () => {
  const data = new Uint8Array(3 * width * height)
  for (let i = 0; i < width * height * 3; i++) {
    const stride = i * 3
    data[stride] = 0
    data[stride + 1] = 0
    data[stride + 2] = 0

    // Random initialization
    if (Math.random() < 0.25) {
      set(data, i)
    }
  }
  // addGlider(data, 6, 56)
  // addGlider(data, 12, 56)
  // addGlider(data, 18, 56)
  // addGlider(data, 24, 56)
  // addGlider(data, 30, 56)
  // addGlider(data, 6, 48)
  // addBeacon(data, 5, 20)
  // addBlinker(data, 5, 25)
  // addToad(data, 12, 27)
  // for (let x = 0; x < width; x += 128) {
  //   for (let y = 0; y < height; y += 128) {
  //     if (y > 2048) {
  //       addRPentamino(data, x, y)
  //     } else {
  //       addAcorn(data, x, y)
  //     }
  //   }
  // }

  // addRPentamino(data, 24, 48)
  // addRPentamino(data, 24, 24)
  // addRPentamino(data, 36, 36)
  // addRPentamino(data, 48, 48)
  // addRPentamino(data, 96, 96)

  const tex = new THREE.DataTexture(data, width, height, THREE.RGBFormat)
  tex.needsUpdate = true
  return tex
}

const rtScene = () => {
  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  })
  // const camera = new THREE.PerspectiveCamera(75, width / height, 0.001, 1000)
  const camera = new THREE.OrthographicCamera(
    -width / 2,
    height / 2,
    width / 2,
    -width / 2,
    0.1,
    10
  )
  camera.position.z = 1
  camera.updateProjectionMatrix()
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffff00)
  const ambientLight = new THREE.AmbientLight(0xffffff)
  scene.add(ambientLight)

  return {
    renderTarget,
    scene,
    camera,
  }
}

const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientWidth,
    0.1,
    1000
  )
  camera.position.z = 500

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera)
  controls.update()

  let renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    premultipliedAlpha: false,
  })
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
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
  })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -Math.PI / 2
  plane.position.z = 1
  plane.position.y = -200
  plane.receiveShadow = true
  scene.add(plane)

  const dataTex = texture()
  const textureOptions = {
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  }
  let currentTexture = new THREE.WebGLRenderTarget(
    width,
    height,
    textureOptions
  )
  let nextTexture = new THREE.WebGLRenderTarget(width, height, textureOptions)

  const {
    renderTarget,
    scene: renderTargetScene,
    camera: renderTargetCamera,
  } = rtScene()

  // const tex1 = texture()
  // const tex2 = texture()

  const geometry = new THREE.PlaneBufferGeometry(width, height)
  const uTexture = {
    type: 't',
    value: texture(),
  }
  const iTime = {
    type: 'f',
    value: 1.5 * Math.PI,
  }
  const material = new THREE.ShaderMaterial({
    vertexShader: vs,
    fragmentShader: fs,
    side: THREE.DoubleSide,
    uniforms: {
      u_texture: uTexture,
      iTime: iTime,
    },
  })
  const object = new THREE.Mesh(geometry, material)

  renderTargetScene.add(object)

  // const object2 = object.clone()

  const sphere = new THREE.SphereBufferGeometry(256, 32, 32)
  const sphereMesh = new THREE.Mesh(sphere, material)
  scene.add(sphereMesh)

  let counter = 1

  const then = 0
  const animate = (now) => {
    // const nowSecs = now * 0.001
    // const deltaSecs = nowSecs - then
    // then = nowSecs
    // iTime.value += 0.0025

    if (renderer) {
      requestAnimationFrame(animate)

      renderer.setRenderTarget(nextTexture)
      renderer.render(renderTargetScene, renderTargetCamera)

      if (counter++ % 1 === 0) {
        const temp = currentTexture
        currentTexture = nextTexture
        uTexture.value = currentTexture.texture
        nextTexture = temp
      }

      renderer.setRenderTarget(null)
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

const GameOfLife = () => <Example notes={notes} init={init} />

export default GameOfLife
