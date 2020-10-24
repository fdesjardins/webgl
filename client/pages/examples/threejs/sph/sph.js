import React from 'react'
import * as THREE from 'three'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes'
import tinygradient from 'tinygradient'

import {
  createAxes,
  addControls,
  createParticle,
  addAxesLabels
} from '../graphing/utils'

// import { buildCells, buildCellNeighbors, assignToCell } from './2d-cell-list'
import { buildCells, buildCellNeighbors, assignToCell } from './3d-cell-list'

const WHITE = 0xffffff
const BLACK = 0x000000

const setupOrthoCamera = ({ domain, margin }) => {
  const width = domain[1] - domain[0]
  const camera = new THREE.OrthographicCamera(
    -width / 2 - margin[0],
    width / 2 + margin[1],
    width / 2 + margin[2],
    -width / 2 - margin[3],
    0.01,
    1000
  )
  camera.updateProjectionMatrix()
  camera.position.z = 50
  return camera
}

const setupPerspectiveCamera = ({ width, height }) => {
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
  camera.position.x = 0
  camera.position.y = 0
  camera.position.z = 50
  return camera
}

const templatePoint = null
const createParticles = ({ n, size, center }) => {
  const point =
    templatePoint ||
    createParticle({
      size,
      color: 0x0000ff,
      transparent: true,
      opacity: 0.65
    })
  const particles = []
  for (let i = 0; i < n; i += 1) {
    const p = point.clone()
    p.position.set(
      center + (Math.random() - 0.5) * 0.1,
      center + (Math.random() - 0.5) * 0.1,
      center + (Math.random() - 0.5) * 0.1
    )
    p.lastPosition = p.position.clone()
    particles.push(p)
  }
  return {
    particles
  }
}

// const lines = connections.map(([m, n]) =>
//   createConnectingLine(points[m], points[n])
// )
// const lines = []
// lines.map(l => scene.add(l))

const createBoundingCube = () => {
  const cubeGeom = new THREE.BoxBufferGeometry(10, 10, 10)
  const cubeMat = new THREE.MeshLambertMaterial({
    color: 0xeeeeee,
    opacity: 0.25,
    transparent: true,
    side: THREE.BackSide
  })
  const cube = new THREE.Mesh(cubeGeom, cubeMat)
  return cube
}

const mousePos = event => {
  const bounds = event.target.getBoundingClientRect()
  const xy = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top
  }
  const x = (xy.x / event.target.clientWidth) * 2 - 1
  const y = -((xy.y / event.target.clientHeight) * 2 - 1)
  return [x, y]
}

const calcF_spring = (particle, obj2, k, restLength) => {
  const d = particle.position.clone().sub(obj2.position)
  const l = d.length()
  const F_spring = d.normalize().multiplyScalar(-1 * k * (l - restLength))

  particle.f.add(F_spring)
}

const F_gravity = new THREE.Vector3(0, -9.81, 0)
const F_pressure = new THREE.Vector3(0, 0, 0)
const F_viscosity = new THREE.Vector3(0, 0, 0)
const F = new THREE.Vector3(0, 0, 0)
const tempPressure = new THREE.Vector3(0, 0, 0)
const tempV = new THREE.Vector3(0, 0, 0)

const visc = (r, h) => 45 / (Math.PI * h ** 6)

const poly6f = (r, h) => {
  if (r > 0 && r < h) {
    return (315 / (64 * h ** 9 * Math.PI)) * (h ** 2 - r ** 2) ** 3
  }
  return 0
}

const spikyf = (r, h) => 15 / (h ** 6 * Math.PI) / (h - r) ** 3

const poly6fg = (r, h) =>
  -1 * r * (945 / (32 * h ** 9 * Math.PI)) * (h ** 2 - r ** 2) ** 2

const sqNorm = v => {
  return v.x ** 2 + v.y ** 2 + v.z ** 2
}
const norm = v => {
  return Math.sqrt(sqNorm(v))
}

const calcDensityPressure = (
  particles,
  neighbors,
  { h, gasConstant, restDensity, mass }
) => {
  particles.map((pi, i) => {
    pi.density = 0
    neighbors[i].map(j => {
      const pj = particles[j]
      const dist = pj.position.distanceTo(pi.position)
      if (dist < h) {
        pi.density += mass * poly6f(dist, h)
      }
    })
    pi.pressure = gasConstant * (pi.density - restDensity)
  })
}

const calcForces = (particles, neighbors, { h, viscosity, mass }) => {
  particles.map((pi, i) => {
    F_pressure.set(0, 0, 0)
    F_viscosity.set(0, 0, 0)
    F.set(0, 0, 0)
    if (!neighbors || neighbors.length === 0) {
      return
    }
    neighbors[i].map(j => {
      const pj = particles[j]
      const r = pj.position.distanceTo(pi.position)
      if (r < h) {
        tempPressure
          .copy(pj.position)
          .sub(pi.position)
          .normalize()
          .multiplyScalar((-1 * (pi.pressure + pj.pressure)) / 2)
        F_pressure.add(tempPressure)

        tempV
          .copy(pj.v)
          .sub(pi.v)
          .multiplyScalar(
            ((viscosity * mass) / pj.density) * visc(r, h) * (h - r)
          )
        F_viscosity.add(tempV)
      }
    })

    F.add(F_gravity)
    F.add(F_pressure)
    F.add(F_viscosity)
    pi.f.add(F)
  })
}

// gravity (m/s)
const G = -9.81

const config = {
  scene: {
    domain: [-20, 20],
    gridSize: 1,
    // l,r,t,b
    margin: [4, 4, 4, 4],
    surfaceResolution: 26
  },
  sim: {
    numParticles: 700,
    numToAdd: 8,
    particleSize: 1
  },
  sph: {
    h: 4,
    gasConstant: 100,
    mass: 5,
    restDensity: 1,
    viscosity: 30
  }
}

const width = config.scene.domain[1] - config.scene.domain[0]
const center = (config.scene.domain[1] + config.scene.domain[0]) / 2

const init = ({ state }) => {
  const canvas = document.getElementById('sph')
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(WHITE)
  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const ambientLight = new THREE.AmbientLight(0x707070)
  scene.add(ambientLight)
  const pointLight = new THREE.PointLight(WHITE)
  pointLight.position.set(20, 20, -20)
  scene.add(pointLight)

  const { domain, gridSize, margin } = config.scene

  const camera = setupOrthoCamera({ domain, margin })
  // const camera = setupPerspectiveCamera({
  //   width: canvas.width,
  //   height: canvas.height
  // })
  const controls = addControls({ camera, renderer })
  controls.target.set(center, center, 0)
  controls.update()

  const grid = new THREE.GridHelper(
    domain[1] - domain[0],
    (domain[1] - domain[0]) / gridSize,
    0x000000,
    0xf2f2f2
  )
  grid.rotation.x = Math.PI / 2
  grid.position.set(center, center, 0)

  const axes = createAxes({ size: (domain[1] - domain[0]) / 2, fontSize: 0 })
  axes.position.set(center, center, 0)
  scene.add(axes)
  addAxesLabels({ scene, domain, gridSize })

  // let lastMousePos = { x: 0.5, y: 0.5 }
  // let label
  // canvas.onmousemove = event => {
  //   const [x, y] = mousePos(event)
  //   lastMousePos = {
  //     x,
  //     y
  //   }
  // }
  // canvas.onmouseleave = () => {
  //   lastMousePos = { x: 0.5, y: 0.5 }
  //   if (label) {
  //     scene.remove(label)
  //     label = null
  //   }
  // }
  // const raycaster = new THREE.Raycaster()

  const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0).normalize(),
    new THREE.Vector3(0, 0, 0),
    width / 4,
    BLACK
  )
  scene.add(arrowHelper)

  const { numParticles, numToAdd, particleSize } = config.sim
  const particles = []
  const connectionsMap = []
  let n = 0
  const particlesSceneNode = new THREE.Group()
  const particleEmitters = [
    new THREE.Vector3(15, 18, 15),
    new THREE.Vector3(-15, 18, 15),
    new THREE.Vector3(15, 18, -15),
    new THREE.Vector3(-15, 18, -15)
  ]
  const interval = setInterval(() => {
    const { particles: newParticles } = createParticles({
      n: numToAdd,
      size: particleSize,
      center
    })
    newParticles.map((p, i) => {
      p.position.add(particleEmitters[i % 4])
      p.lastPosition = p.position.clone()
      p.v = new THREE.Vector3(0, 0, 0)
      p.f = new THREE.Vector3(0, 0, 0)
      p.lastf = new THREE.Vector3(0, 0, 0)
      const len = particles.length
      connectionsMap[len] = []
      connectionsMap.map((_, j) => {
        connectionsMap[j].push(len)
        connectionsMap[len].push(j)
      })
      particles.push(p)
      particlesSceneNode.add(p)
    })

    n += numToAdd
    if (n >= numParticles) {
      clearInterval(interval)
    }
  }, 100)

  const tempPos = new THREE.Vector3()
  const F_g = new THREE.Vector3(0, G, 0)
  const xAxis = new THREE.Vector3(1, 0, 0)
  const zAxis = new THREE.Vector3(0, 0, 1)
  let thenSecs = 0

  const cellmin = domain[0]
  const cellmax = domain[1]
  const cellw = 2.5
  const stride = (domain[1] - domain[0]) / cellw

  const cells = buildCells({ cellmin, cellmax, cellw })

  const cellNeighbors = buildCellNeighbors(cells, {
    cellmin,
    cellmax,
    cellw,
    stride
  })

  const cubesMaterial = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    opacity: 0.85,
    transparent: true,
    refractionRatio: 0.5,
    vertexColors: THREE.VertexColors,
    shininess: 60
  })
  let cubesInstance = new MarchingCubes(24, cubesMaterial, true, true)
  cubesInstance.position.set(0, 0, 0)
  cubesInstance.scale.set(40, 40, 40)

  const carribean = [
    '#cbdcf2',
    '#91e1e9',
    '#00c0e3',
    '#0096cc',
    '#006fb6',
    '#044185'
  ]
  const lava = ['#fff1a1', '#d9a848', '#c93200', '#841800', '#3d0a03']
  const acid = ['#b0bf1a', '#3b8e22', '#1e4d2b', '#0d2b0f']
  const gradient = tinygradient(lava)
  const lookUpTable = {}
  const gradientMax = config.sph.restDensity * 2
  const gradientMin = config.sph.restDensity / 2
  for (let i = gradientMin; i <= gradientMax; i += 0.1) {
    lookUpTable[i.toFixed(1).toString()] = new THREE.Color(
      gradient.rgbAt(i / gradientMax).toHexString()
    )
  }
  const maxColor = new THREE.Color(
    lookUpTable[Object.keys(lookUpTable).length - 1]
  )

  const animate = now => {
    if (!renderer) {
      return
    }
    controls.update()
    requestAnimationFrame(animate)

    const nowSecs = now * 0.001
    let deltaSecs = nowSecs - thenSecs
    thenSecs = nowSecs

    if (!deltaSecs) {
      deltaSecs = 0
    }

    const dt = state.get('timestep')

    F_gravity.copy(F_g)
      .applyAxisAngle(zAxis, 0.5 * Math.sin(nowSecs / 2))
      .applyAxisAngle(xAxis, 0.5 * Math.cos(nowSecs / 3))
    arrowHelper.setDirection(F_gravity.clone().normalize())

    // Rebuild neighbors list
    const particleCellIndices = particles.map(p => {
      return assignToCell(cells, cellw, p.position)
    })
    const neighbors = particleCellIndices.map(cellIndex => {
      const neighboringCells = cellNeighbors[cellIndex]
      const nb = []
      particleCellIndices.map((b, j) => {
        if (neighboringCells.includes(b) || cellIndex === b) {
          nb.push(j)
        }
      })
      return nb
    })

    particles.map((p, i) => {
      p.lookAt(camera.position)

      // Velocity Verlet Method
      // tempV.copy(p.v).multiplyScalar(dt)
      // tempPos.copy(p.position).add(tempV)
      // tempV
      //   .copy(p.f)
      //   .divideScalar(2)
      //   .multiplyScalar(dt ** 2)
      // tempPos.add(tempV)
      // p.position.copy(tempPos)
      // p.lastf.copy(p.f)

      p.f.set(0, 0, 0)
    })

    // Calculate forces
    calcDensityPressure(particles, neighbors, config.sph)
    //
    // const mousePosVec = new THREE.Vector2(lastMousePos.x, lastMousePos.y)
    // raycaster.setFromCamera(mousePosVec, camera)
    // const intersects = raycaster.intersectObjects(particles)
    // if (intersects.length > 0) {
    //   intersects[0].object.pressure += 500
    // }

    calcForces(particles, neighbors, config.sph)

    const particleRadius = particleSize / 2

    particles.map((p, i) => {
      // Euler Method
      // const newPos = p.position.clone().add(p.v.clone().multiplyScalar(dt))
      // const newVel = p.v.clone().add(p.f.clone().multiplyScalar(dt))
      // p.lastPosition.copy(p.position)
      // p.position.copy(newPos)
      // p.v.copy(newVel)

      // Verlet Method
      tempPos
        .copy(p.position)
        .multiplyScalar(2)
        .sub(p.lastPosition)
        .add(p.f.clone().multiplyScalar(dt ** 2))
      p.lastPosition.copy(p.position)
      p.position.copy(tempPos)
      p.v
        .copy(tempPos)
        .sub(p.lastPosition)
        .divideScalar(2 * dt)

      // Velocity Verlet
      // tempV
      //   .copy(p.f)
      //   .add(p.lastf)
      //   .divideScalar(2)
      //   .multiplyScalar(dt)
      // p.v.add(tempV)

      // Handle Boundary Conditions
      const damping = -0.8
      if (p.position.x + particleRadius > domain[1]) {
        p.v.x = damping * p.v.x
        p.position.x = domain[1] - particleRadius
      } else if (p.position.x - particleRadius < -1 * domain[1]) {
        p.v.x = damping * p.v.x
        p.position.x = domain[0] + particleRadius
      }
      if (p.position.y + particleRadius > domain[1]) {
        p.v.y = damping * p.v.y
        p.position.y = domain[1] - particleRadius
      } else if (p.position.y - particleRadius < -1 * domain[1]) {
        p.v.y = damping * p.v.y
        p.position.y = domain[0] + particleRadius
      }
      if (p.position.z + particleRadius > domain[1]) {
        p.v.z = damping * p.v.z
        p.position.z = domain[1] - particleRadius
      } else if (p.position.z - particleRadius < -1 * domain[1]) {
        p.v.z = damping * p.v.z
        p.position.z = domain[0] + particleRadius
      }
    })

    cubesInstance.reset()

    // Update color of particles and fluid
    particles.map(p => {
      const color = lookUpTable[p.density.toFixed(1)] || maxColor
      p.material.color.set(color)
      cubesInstance.addBall(
        (p.position.x + 40) / 80,
        (p.position.y + 40) / 80,
        (p.position.z + 40) / 80,
        0.025,
        7,
        new THREE.Color(color)
      )
    })

    // if (label) {
    //   label.lookAt(camera.position)
    // }
    // if (intersects.length === 0 && label) {
    //   scene.remove(label)
    //   label = null
    // } else if (intersects.length > 0) {
    //   const target = intersects[0]
    //   const { position, v, density, pressure } = target.object
    //   if (label) {
    //     scene.remove(label)
    //     label = null
    //   }
    //   label = createLabel({
    //     text: `Pos: (${position.x.toFixed(2)}, ${position.y.toFixed(
    //       2
    //     )})\nVel: (${v.x.toFixed(2)})\nDen: (${density.toFixed(
    //       2
    //     )})\nPrs: (${pressure.toFixed(2)})`,
    //     color: BLACK,
    //     size: gridSize / 2
    //   })
    //   label.position.set(
    //     target.object.position.x,
    //     target.object.position.y,
    //     target.object.position.z
    //   )
    //   const labelToCam = label.position.clone().sub(camera.position)
    //   labelToCam.normalize()
    //   label.position.sub(labelToCam.multiplyScalar(10))
    //   scene.add(label)
    //   label.lookAt(camera.position)
    // }

    if (state.get('showGrid')) {
      scene.add(grid)
    } else {
      scene.remove(grid)
    }
    if (state.get('showSurface')) {
      scene.add(cubesInstance)
    } else {
      scene.remove(cubesInstance)
    }
    if (state.get('showParticles')) {
      scene.add(particlesSceneNode)
    } else {
      scene.remove(particlesSceneNode)
    }
    config.sph.viscosity = state.get('viscosity')
    const surfaceResolution = state.get('surfaceResolution')
    if (config.scene.surfaceResolution !== surfaceResolution) {
      scene.remove(cubesInstance)
      cubesInstance = new MarchingCubes(
        surfaceResolution,
        cubesMaterial,
        true,
        true
      )
      cubesInstance.position.set(0, 0, 0)
      cubesInstance.scale.set(40, 40, 40)
      config.scene.surfaceResolution = surfaceResolution
    }

    renderer.render(scene, camera)
  }
  animate()

  return () => {
    renderer.dispose()
    
    scene = null
    renderer = null
  }
}

const SPH = ({ state, labels }) => {
  React.useEffect(() => {
    if (document.getElementById('sph')) {
      return init({ state })
    }
  })
  return <canvas id="sph" />
}

export { init }
export default SPH
