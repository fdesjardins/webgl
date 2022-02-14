import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const createPoint = ({ size = 0.125, color = 0x000000, transparent = false, opacity = 1 }) => {
  const geometry = new THREE.SphereBufferGeometry(size, size)
  const material = new THREE.MeshBasicMaterial({
    color,
    opacity,
    transparent,
  })
  const object = new THREE.Mesh(geometry, material)
  return object
}

const config = {
  initialPosition: new THREE.Vector3(2.0, 0.0, 0.0),
  anchorPosition: new THREE.Vector3(0.0, 0.0, 0.0),
}

export const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    2000
  )
  camera.position.x = 0
  camera.position.y = 0
  camera.position.z = 15
  scene.add(camera)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.update()

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

  const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 0).normalize(),
    config.anchorPosition,
    0.0,
    0xffffff
  )
  scene.add(arrowHelper)

  const gridHelper = new THREE.GridHelper(10, 10, 0xffffff, 0x444444)
  gridHelper.position.set(0.0, -5.0, 0.0)
  scene.add(gridHelper)

  const point = createPoint({ size: 0.25, color: 0x0000ff })
  point.mass = 1e-3
  point.lastPosition = new THREE.Vector3()
  point.position.copy(config.initialPosition)
  point.lastPosition.copy(point.position)
  point.f = new THREE.Vector3()
  scene.add(point)

  const point2 = createPoint({ size: 0.1, color: 0x0000ff })
  point2.mass = 1e-3
  point2.lastPosition = new THREE.Vector3()
  point2.position.copy(new THREE.Vector3(2.0, 0.0, 2.0))
  point2.lastPosition.copy(point2.position)
  point2.f = new THREE.Vector3()
  scene.add(point2)

  const anchor = createPoint({ size: 0.05, color: 0xffffff })
  anchor.position.copy(config.anchorPosition)
  scene.add(anchor)

  const gravityForce = new THREE.Vector3(0, -9.81, 0)
  const springConst = 100.0
  const restLength = 2.0
  const tempPos = new THREE.Vector3()
  // const dt = 0.025

  const clock = new THREE.Clock()
  const animate = () => {
    if (!renderer) {
      return
    }
    requestAnimationFrame(animate)
    const dt = clock.getDelta()

    // Calc forces
    point.f.copy(gravityForce)
    const d = point.position.clone().sub(anchor.position)
    const l = d.length()
    point.f.add(d.normalize().multiplyScalar(-1 * springConst * (l - restLength)))
    point.v = point.position.clone().sub(point.lastPosition) / dt
    // const f_damper = 1 * point.v
    // point.f.add(f_damper)
    const dp = point.position.clone().sub(point2.position)
    const dpl = d.length()
    point.f.add(dp.normalize().multiplyScalar(-1 * springConst * (dpl - restLength) * point2.mass))

    point2.f.copy(gravityForce)
    const d2 = point2.position.clone().sub(point.position)
    const l2 = d2.length()
    point2.f.add(d2.normalize().multiplyScalar(-1 * springConst * (l2 - restLength)))

    // Integrate
    tempPos
      .copy(point.position)
      .multiplyScalar(2)
      .sub(point.lastPosition)
      .add(point.f.clone().multiplyScalar(dt ** 2))
    point.lastPosition.copy(point.position)
    point.position.copy(tempPos)

    tempPos
      .copy(point2.position)
      .multiplyScalar(2)
      .sub(point2.lastPosition)
      .add(point2.f.clone().multiplyScalar(dt ** 2))
    point2.lastPosition.copy(point2.position)
    point2.position.copy(tempPos)

    // Other updates
    arrowHelper.setDirection(point.position.clone().sub(anchor.position).normalize())
    arrowHelper.setLength(point.position.clone().sub(anchor.position).length())

    renderer.render(scene, camera)
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
