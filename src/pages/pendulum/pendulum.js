import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const createPoint = ({ size = 0.125, color = 0x000000, transparent = false, opacity = 1 }) => {
  const geometry = new THREE.SphereGeometry(size, size)
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
    2000,
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
    0xffffff,
  )
  scene.add(arrowHelper)

  const gridHelper = new THREE.GridHelper(10, 10, 0xffffff, 0x444444)
  gridHelper.position.set(0.0, -5.0, 0.0)
  scene.add(gridHelper)

  const nuc = createPoint({ size: 0.5, color: 0x0000ff })
  nuc.mass = 1e-2
  nuc.lastPosition = new THREE.Vector3()
  nuc.position.copy(config.initialPosition)
  nuc.lastPosition.copy(nuc.position)
  nuc.f = new THREE.Vector3()
  scene.add(nuc)

  const ambient = new THREE.AmbientLight(0x00ffff, 20)
  scene.add(ambient)

  // const point2 = createPoint({ size: 0.1, color: 0x0000ff })
  // point2.mass = 1e-3
  // point2.lastPosition = new THREE.Vector3()
  // point2.position.copy(new THREE.Vector3(2.0, 0.0, 2.0))
  // point2.lastPosition.copy(point2.position)
  // point2.f = new THREE.Vector3()
  // scene.add(point2)

  // const point3 = createPoint({ size: 0.1, color: 0x0000ff })
  // point3.mass = 1e-3
  // point3.lastPosition = new THREE.Vector3()
  // point3.position.copy(new THREE.Vector3(2.0, 2.0, 2.0))
  // point3.lastPosition.copy(point3.position)
  // point3.f = new THREE.Vector3()
  // scene.add(point3)

  const rand = (len, mul) => new Array(len).keys().map(() => Math.random() * mul)
  const vec3 = (...args) => new THREE.Vector3(...args)

  const numPoints = 8
  const points = Array.from(new Array(numPoints).keys()).map((i) => {
    const p = createPoint({ size: 0.1, color: 0x0000ff })
    p.mass = 1e-3
    p.lastPosition = vec3()
    p.position.copy(vec3(...rand(3, 4)))
    p.position.sub(vec3(0, 2, 0))
    p.lastPosition.copy(p.position)
    p.f = vec3()
    scene.add(p)
    return p
  })

  const anchor = createPoint({ size: 0.05, color: 0xffffff })
  anchor.position.copy(config.anchorPosition)
  scene.add(anchor)

  const gravityForce = vec3(0, -9.81, 0)
  const springConst = 100.0
  const restLength = 2
  const tempPos = vec3()
  // const dt = 0.025

  const clock = new THREE.Clock()
  const animate = () => {
    if (!renderer) {
      return
    }
    requestAnimationFrame(animate)
    const dt = clock.getDelta()

    // Calc forces
    nuc.f.copy(gravityForce)
    const d = nuc.position.clone().sub(anchor.position)
    const l = d.length()
    nuc.f.add(d.normalize().multiplyScalar(-1 * springConst * (l - restLength)))
    nuc.v = nuc.position.clone().sub(nuc.lastPosition) / dt

    // Point-nucleus interactions
    for (const p of points) {
      const dp = nuc.position.clone().sub(p.position)
      const dpl = d.length()
      // nuc.f.add(dp.normalize().multiplyScalar(-0.0 * springConst * (dpl - restLength) * p.mass))

      p.f.copy(gravityForce)
      const d2 = p.position.clone().sub(nuc.position)
      const l = d2.length()
      p.f.add(d2.normalize().multiplyScalar(-1 * springConst * (l - restLength)))
    }

    // Point-point interactions
    for (const p of points) {
      for (const p2 of points) {
        if (p === p2) {
          continue
        }
        const d = p.position.clone().sub(p2.position)
        const l = d.length()
        p.f.add(d.normalize().multiplyScalar(-1 * springConst * 0.2 * (l - restLength * 4)))
      }
    }

    // Integrate
    tempPos
      .copy(nuc.position)
      .multiplyScalar(2)
      .sub(nuc.lastPosition)
      .add(nuc.f.clone().multiplyScalar(dt ** 2))
    nuc.lastPosition.copy(nuc.position)
    nuc.position.copy(tempPos)

    for (const p of points) {
      tempPos
        .copy(p.position)
        .multiplyScalar(2)
        .sub(p.lastPosition)
        .add(p.f.clone().multiplyScalar(dt ** 2))
      p.lastPosition.copy(p.position)
      p.position.copy(tempPos)
    }

    // Show velocity
    for (const p of points) {
      const v = p.lastPosition
        .clone()
        .sub(p.position)
        .multiplyScalar(1 / dt)
      const s = Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z)
      p.material.color.set(...vec3(s, s / 2, s / 3).multiplyScalar(6e-2))
    }

    // Other updates
    arrowHelper.setDirection(nuc.position.clone().sub(anchor.position).normalize())
    arrowHelper.setLength(nuc.position.clone().sub(anchor.position).length())

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
