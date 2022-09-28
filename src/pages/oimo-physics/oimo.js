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
  camera.position.set(0, 5, 10)

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)

  let scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  const controls = new OrbitControls(camera, canvas)
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

  // const randInt = () => {
  //   return Math.floor(Math.random() * 10)
  // }
  const world = new OIMO.World({
    timestep: 1 / 30,
    iterations: 8,
    broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
    worldscale: 1,
    random: true,
    info: true,
    gravity: [0, -9.8, 0],
  })

  const ground = { size: [50, 0.1, 50], pos: [0, 0, 0], density: 1 }
  world.add(ground)

  const size = 50
  const divisions = 50
  const gridHelper = new THREE.GridHelper(size, divisions)
  gridHelper.position.set(0, 0, 0)
  scene.add(gridHelper)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 3, 5)
  scene.add(light)

  const sphere = new THREE.IcosahedronBufferGeometry(1, 2)

  const addBody = () => {
    const x = (Math.random() - 1) * 5
    const y = (Math.random() - 1) * 5
    const size = Math.random() * 3
    const body = world.add({
      type: 'sphere', // type of shape : sphere, box, cylinder
      size: [size, size, size], // size of shape
      pos: [x, 20, y], // start position in degree
      rot: [0, 0, 0], // start rotation in degree
      move: true, // dynamic or statique
      density: 1,
      friction: 0.2,
      restitution: 1 / size,
      belongsTo: 1, // The bits of the collision groups to which the shape belongs.
      collidesWith: 0xffffffff, // The bits of the collision groups with which the shape collides.
    })
    const mesh = new THREE.Mesh(
      sphere,
      new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff })
    )
    const update = () => {
      mesh.position.copy(body.getPosition())
      mesh.quaternion.copy(body.getQuaternion())
    }
    const destroy = () => {}
    return {
      body,
      mesh,
      update,
      destroy,
    }
  }

  const bodies = []

  const animate = () => {
    if (!renderer) {
      return
    }

    if (Math.random() < 0.15) {
      const body = addBody()
      bodies.push(body)
      scene.add(body.mesh)
    }
    bodies.map((b) => b.update())

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
