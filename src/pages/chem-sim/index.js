import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats.js'
// import { vs } from '../gpu-sph/shaders'
import sdfSceneFs from './fs.glsl'
import updatePosFs from './update-position.fs.glsl'
import { onResize } from '../../utils'

export const meta = {
  tags: 'threejs,gpgpu',
  title: 'GPU Chemistry Simulation',
  slug: 'chem-sim',
}

export const options = {
  display: 'fullscreen',
}

const WIDTH = 8
const HEIGHT = 8
const PARTICLES = WIDTH * HEIGHT

const createDataTexture = (width, height) => {
  const data = new Float32Array(4 * width * height)
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType)
  return texture
}

const fillTexture = (texture) => {
  const data = texture.image.data
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 0
    data[i + 1] = 0
    data[i + 2] = 0
    data[i + 3] = 0
  }
}

const createRenderTarget = (width, height) => {
  const options = {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  }
  return new THREE.WebGLRenderTarget(width, height, options)
}

const drawVs = `
uniform sampler2D u_position;

varying vec2 vUv;

void main(){
  vUv = uv;
  vec4 pos = texture2D(u_position, uv);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz, 1.0);
}`

const drawFs = `
varying vec2 vUv;

void main(){
  float distance = length(2.0 * gl_PointCoord - 1.0);
  if (distance > 1.0) {
    discard;
  }
  gl_FragColor = vec4(1.0);
}
`

const vs = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
}`

// const updatePosFs = `
// uniform sampler2D u_position;
// uniform vec2 u_resolution;
// uniform float u_time;
// void main(){
//   vec2 uv = gl_FragCoord.xy / u_resolution.xy;
//   vec4 pos = texture2D(u_position, uv);
//   pos.y = 0.05 * sin(u_time);
//   gl_FragColor = pos;
// }`

const createParticles = (count, width, uniforms) => {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const uvs = new Float32Array(count * 2)
  let p = 0
  for (let j = 0; j < width; j += 1) {
    for (let i = 0; i < width; i += 1) {
      uvs[p++] = i / (width - 1)
      uvs[p++] = j / (width - 1)
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: drawVs,
    fragmentShader: drawFs,
    transparent: true,
  })
  material.extensions.drawBuffers = true

  const particles = new THREE.Points(geometry, material)
  particles.matrixAutoUpdate = false
  particles.updateMatrix()

  return particles
}

const testSphereMesh = () => {
  const geometry = new THREE.SphereGeometry(1)
  const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0, 0, 0)
  return mesh
}

const floorMesh = () => {
  const geometry = new THREE.PlaneBufferGeometry(10, 10)
  const material = new THREE.MeshLambertMaterial({ color: 0xffffff })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0, 0, 0)
  mesh.rotateX(-1.1)
  return mesh
}

const createUniforms = (canvas, dataTexture) => {
  return {
    u_position: new THREE.Uniform(dataTexture),
    u_data_resolution: new THREE.Uniform(new THREE.Vector2(WIDTH, HEIGHT)),
    u_resolution: new THREE.Uniform(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight)),
    u_time: new THREE.Uniform(0),
    u_camera_position: new THREE.Uniform(new THREE.Vector3()),
    u_camera_direction: new THREE.Uniform(new THREE.Vector3()),
  }
}

const createFinalRenderPlane = (uniforms) => {
  const geometry = new THREE.PlaneBufferGeometry(40, 40, 2, 2)
  const material = new THREE.ShaderMaterial({
    fragmentShader: sdfSceneFs,
    vertexShader: vs,
    uniforms,
  })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

export const init = ({ canvas, container }) => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const stats = new Stats()
  stats.showPanel(0)
  container.appendChild(stats.dom)
  stats.dom.className = 'stats'

  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.1, 2000)
  camera.updateProjectionMatrix()
  camera.position.set(0, 10, 150)
  camera.lookAt(0, 0, 0)

  let renderer = new THREE.WebGLRenderer({
    canvas,
    antiAlias: true,
    powerPreference: 'high-performance',
    stencil: false,
  })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.update()

  const ambientLight = new THREE.AmbientLight(0x707070)
  scene.add(ambientLight)

  // const sphere = testSphereMesh()
  // scene.add(sphere)
  // const floor = floorMesh()
  // scene.add(floor)

  const dataTexture = createDataTexture(WIDTH, HEIGHT)
  fillTexture(dataTexture)

  const createRenderTargetPair = () => [
    createRenderTarget(WIDTH, HEIGHT),
    createRenderTarget(WIDTH, HEIGHT),
  ]
  const renderTargets = createRenderTargetPair()

  const renderTargetScene = new THREE.Scene()
  const renderTargetCamera = new THREE.OrthographicCamera(
    -WIDTH / 2,
    HEIGHT / 2,
    WIDTH / 2,
    -HEIGHT / 2,
    0.1,
    10
  )
  renderTargetCamera.position.z = 1
  renderTargetCamera.updateProjectionMatrix()

  const uniforms = createUniforms(canvas, dataTexture)
  const finalRenderPlane = createFinalRenderPlane(uniforms)
  scene.add(finalRenderPlane)

  const handleResize = (event) => {
    event.preventDefault()
    onResize({ canvas, camera, renderer })
    uniforms.u_resolution.value = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight)
  }
  window.addEventListener('resize', handleResize, false)
  onResize({ canvas, camera, renderer })

  const material = new THREE.ShaderMaterial({
    vertexShader: vs,
    fragmentShader: updatePosFs,
    uniforms,
  })
  const geometry = new THREE.PlaneBufferGeometry(WIDTH, HEIGHT)
  const object = new THREE.Mesh(geometry, material)
  renderTargetScene.add(object)

  const particles = createParticles(PARTICLES, WIDTH, uniforms)
  scene.add(particles)

  const data = new Float32Array(4 * WIDTH * HEIGHT)
  const clock = new THREE.Clock()
  const camDirection = new THREE.Vector3()

  const animate = () => {
    if (!renderer) {
      return
    }
    requestAnimationFrame(animate)
    // setTimeout(() => requestAnimationFrame(animate), 100)

    stats.begin()
    const delta = clock.getDelta()
    uniforms.u_time.value += delta
    controls.update(delta)

    object.material = material
    renderer.setRenderTarget(renderTargets[1])
    renderer.render(renderTargetScene, renderTargetCamera)
    const temp = renderTargets[0]
    renderTargets[0] = renderTargets[1]
    uniforms.u_position.value = renderTargets[0].texture
    renderTargets[1] = temp

    // Read renderTarget texture data into `data` array
    // const context = renderer.getContext()
    // context.readPixels(0, 0, WIDTH, HEIGHT, context.RGBA, context.FLOAT, data)
    // console.log(data)

    renderer.setRenderTarget(null)
    camera.getWorldDirection(camDirection)
    camDirection.normalize()
    finalRenderPlane.position.copy(camera.position.clone().add(camDirection.multiplyScalar(13)))
    finalRenderPlane.lookAt(camera.position.clone())

    uniforms.u_camera_position.value.copy(camera.position)
    uniforms.u_camera_direction.value.copy(camDirection)

    // sphere.position.set(data[0], data[1], data[2])
    renderer.render(scene, camera)

    stats.end()
  }
  animate()

  return () => {
    renderer.dispose()
    renderer = null
    window.removeEventListener('resize', handleResize)
    stats.scene = null
    container.removeChild(stats.dom)
    controls.dispose()
  }
}
