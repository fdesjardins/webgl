import * as THREE from 'three'
import * as OIMO from 'oimo'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export const init = ({ canvas, container }) => {
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.set(10, 7, 10)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)

  let scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  const controls = new OrbitControls(camera, canvas)
  controls.update()
  controls.autoRotate = 1
  controls.autoRotateSpeed = -1

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

  const world = new OIMO.World({
    timestep: 1 / 60,
    iterations: 8,
    broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
    worldscale: 0.5,
    random: true,
    info: true,
    gravity: [0, -9.8, 0],
  })

  const ground = {
    size: [50, 80, 50],
    pos: [0, -40, 0],
  }
  const oimoGround = world.add(ground)

  const size = 50
  const divisions = 50
  const gridHelper = new THREE.GridHelper(size, divisions)
  scene.add(gridHelper)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 7, 9)
  scene.add(light)

  const sphere = new THREE.SphereGeometry(0.5, 16, 10)

  const addBody = () => {
    const x = (Math.random() - 1) * 5
    const y = (Math.random() - 1) * 5
    const size = Math.random() * 3
    const body = world.add({
      type: 'sphere', // type of shape : sphere, box, cylinder
      size: [size / 2, size / 2, size / 2], // size of shape
      pos: [x, 20, y], // start position in degree
      rot: [0, 0, 0], // start rotation in degree
      move: true, // dynamic or statique
      density: 1,
      friction: 0.2,
      restitution: Math.min(2, 2 / size),
      belongsTo: 1, // The bits of the collision groups to which the shape belongs.
      collidesWith: 0xffffffff, // The bits of the collision groups with which the shape collides.
    })
    const color = new THREE.Color(Math.random() * 0xffffff)
    const mesh = new THREE.Mesh(
      sphere,
      new THREE.MeshPhongMaterial({
        color,
        emissive: new THREE.Color(color.r * 0.2, color.g * 0.2, color.b * 0.2),
      })
    )
    const update = () => {
      mesh.position.copy(body.getPosition())
      mesh.quaternion.copy(body.getQuaternion())
    }
    mesh.scale.setScalar(size)
    const destroy = () => {
      world.remove(body)
      mesh.material.dispose()
    }
    return {
      body,
      mesh,
      update,
      destroy,
    }
  }

  const bodies = []

  const clock = new THREE.Clock()
  const animate = () => {
    if (!renderer) {
      return
    }
    controls.update(clock.getDelta())

    if (Math.random() < 0.15) {
      const body = addBody()
      bodies.push(body)
      scene.add(body.mesh)
    }

    // Clean up any objects that have fallen off the grid
    bodies.forEach((b) => {
      b.update()
      if (b.mesh.position.y < -10) {
        scene.remove(b.mesh)
        b.destroy()
      }
    })

    renderer.render(scene, camera)
  }

  world.step()
  world.postLoop = animate
  world.play()

  return () => {
    renderer.dispose()
    scene = null
    renderer = null
    window.removeEventListener('resize', handleResize)
  }
}
