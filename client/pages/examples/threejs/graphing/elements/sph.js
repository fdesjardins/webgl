import React from 'react'
import * as THREE from 'three'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes'

import {
  createAxes,
  createLabel,
  addControls,
  createPoint,
  createParticle,
  addAxesLabels
} from '../utils'

const WHITE = 0xffffff
const BLACK = 0x000000

const setupCamera = ({ domain, margin }) => {
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

const restDensity = 10
const gasConstant = 10
const h = 2.25
const hsq = h ** 2
const mass = 10
const viscosity = 30
const poly6 = 315 / (64 * Math.PI * h ** 9)
const spiky = -45 / (Math.PI * h ** 6)
const visc = 45 / (Math.PI * h ** 6)

const sqNorm = v => {
  return v.x ** 2 + v.y ** 2 + v.z ** 2
}
const norm = v => {
  return Math.sqrt(sqNorm(v))
}

const poly6f = r => (315 / (64 * h ** 9 * Math.PI)) * (h ** 2 - r ** 2) ** 3
const poly6fg = r =>
  -1 * r * (945 / (32 * h ** 9 * Math.PI)) * (h ** 2 - r ** 2) ** 2

const spikyf = r => 15 / (h ** 6 * Math.PI) / (h - r) ** 3

const calcDensityPressure = particles => {
  particles.map((pi, i) => {
    pi.density = 0
    particles.map((pj, j) => {
      if (i === j) {
        return
      }
      const dist = pj.position.distanceTo(pi.position)
      if (dist < h) {
        pi.density += mass * poly6f(dist)
      }
    })
    pi.pressure = gasConstant * (pi.density - restDensity)
  })
}

const F_gravity = new THREE.Vector3(0, -9.81, 0)
const F_pressure = new THREE.Vector3(0, 0, 0)
const F_viscosity = new THREE.Vector3(0, 0, 0)
const F = new THREE.Vector3(0, 0, 0)
const tempPressure = new THREE.Vector3(0, 0, 0)
const tempV = new THREE.Vector3(0, 0, 0)

const calcForces = (particles, neighbors) => {
  particles.map((pi, i) => {
    F_pressure.set(0, 0, 0)
    F_viscosity.set(0, 0, 0)
    F.set(0, 0, 0)
    if (!neighbors || neighbors.length === 0) {
      return
    }
    neighbors[i].map(j => {
      if (i === j) {
        return
      }
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
          .multiplyScalar(((viscosity * mass) / pj.density) * visc * (h - r))
        F_viscosity.add(tempV)
      }
    })

    F.add(F_gravity)
    F.add(F_pressure)
    F.add(F_viscosity)
    pi.f.add(F)
  })
}

const calcForces1 = particles => {
  particles.map((pi, i) => {
    F_pressure.set(0, 0, 0)
    F_viscosity.set(0, 0, 0)
    F.set(0, 0, 0)
    particles.map((pj, j) => {
      if (i === j) {
        return
      }
      const rij = pj.position.clone().sub(pi.position)
      const r = norm(rij)

      if (r < h) {
        const pressure = rij
          .clone()
          .normalize()
          .multiplyScalar(
            ((-1 * mass * (pi.pressure + pj.pressure)) / (2 * pj.rho)) *
              spiky *
              (h - r) ** 2
          )
        F_pressure.add(pressure)
        F_viscosity.add(
          pj.v
            .clone()
            .sub(pi.v)
            .multiplyScalar(((viscosity * mass) / pj.rho) * visc * (h - r))
        )
      }
    })

    F.add(F_gravity.clone().multiplyScalar(pi.rho))
    F.add(F_pressure)
    // F.add(F_viscosity)
    pi.f.add(F)
  })
}

const init = ({ state }) => {
  const canvas = document.getElementById('sph')
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(WHITE)
  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const domain = [-20, 20]
  const gridSize = 1
  const width = domain[1] - domain[0]
  // left, right, top, bottom
  const margin = [width / 10, width / 10, width / 10, width / 10]

  const center = (domain[1] + domain[0]) / 2

  const camera = setupCamera({ domain, margin })
  const controls = addControls({ camera, renderer })
  controls.target.set(center, center, 0)
  controls.update()

  const ambientLight = new THREE.AmbientLight(WHITE)
  scene.add(ambientLight)

  const grid = new THREE.GridHelper(
    domain[1] - domain[0],
    (domain[1] - domain[0]) / gridSize,
    0x000000,
    0xbbbbbb
  )
  grid.rotation.x = Math.PI / 2
  grid.position.set(center, center, 0)
  scene.add(grid)

  const axes = createAxes({ size: (domain[1] - domain[0]) / 2, fontSize: 0 })
  axes.position.set(center, center, 0)
  scene.add(axes)
  addAxesLabels({ scene, domain, gridSize })

  let lastMousePos = { x: 0.5, y: 0.5 }
  let label

  canvas.onmousemove = event => {
    const [x, y] = mousePos(event)
    lastMousePos = {
      x,
      y
    }
  }
  canvas.onmouseleave = () => {
    lastMousePos = { x: 0.5, y: 0.5 }
    if (label) {
      scene.remove(label)
      label = null
    }
  }

  const raycaster = new THREE.Raycaster()

  const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0).normalize(),
    new THREE.Vector3(0, 0, 0),
    width / 4,
    BLACK
  )
  scene.add(arrowHelper)

  // gravity (m/s)
  const g = -9.81
  // spring forces
  // const restLength = 7
  // const k = 5
  const numParticles = 700
  const numToAdd = 5
  const particleSize = gridSize * 2.5

  const particles = []
  const connectionsMap = []
  let n = 0
  const interval = setInterval(() => {
    const { particles: newParticles } = createParticles({
      n: numToAdd,
      size: particleSize,
      center
    })

    newParticles.map((p, i) => {
      p.v = new THREE.Vector3(0, 0, 0)
      p.lastPosition = p.position.clone()
      p.f = new THREE.Vector3(0, 0, 0)
      p.lastf = new THREE.Vector3(0, 0, 0)
      const len = particles.length
      connectionsMap[len] = []
      connectionsMap.map((_, j) => {
        connectionsMap[j].push(len)
        connectionsMap[len].push(j)
      })
      particles.push(p)
      // scene && scene.add(p)
    })

    n += numToAdd
    if (n >= numParticles) {
      clearInterval(interval)
    }
  }, 50)

  const tempPos = new THREE.Vector3()
  const tempDir = new THREE.Vector3()
  const F_g = new THREE.Vector3(0, g, 0)
  const xAxis = new THREE.Vector3(1, 0, 0)
  const zAxis = new THREE.Vector3(0, 0, 1)
  let thenSecs = 0

  const cells = []
  const cellmin = domain[0]
  const cellmax = domain[1]
  const cellw = 5
  const stride = (domain[1] - domain[0]) / cellw
  for (let i = cellmin; i < cellmax; i += cellw) {
    for (let j = cellmin; j < cellmax; j += cellw) {
      // for (let k = -10; k < 10; k += 10) {
      //   cells.push([i, j, k])
      // }
      cells.push([i, j])
    }
  }

  const neighbors = cells.map((cell, i) => {
    const nb = []
    if (cell[0] === cellmin && cell[1] === cellmin) {
      nb.push(i + 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    } else if (cell[0] === cellmin && cell[1] < cellmax - cellw) {
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    } else if (cell[0] === cellmin && cell[1] === cellmax - cellw) {
      nb.push(i - 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
    } else if (cell[0] < cellmax - cellw && cell[1] === cellmin) {
      nb.push(i + 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    } else if (cell[0] === cellmax - cellw && cell[1] === cellmin) {
      nb.push(i + 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
    } else if (cell[0] === cellmax - cellw && cell[1] < cellmax - cellw) {
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
    } else if (cell[0] === cellmax - cellw && cell[1] === cellmax - cellw) {
      nb.push(i - 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
    } else if (cell[0] < cellmax - cellw && cell[1] === cellmax - cellw) {
      nb.push(i - 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i + stride - 1)
      nb.push(i + stride)
    } else {
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    }
    return nb
  })

  const cubesMaterial = new THREE.MeshPhongMaterial({
    color: 0xffeeaa,
    opacity: 0.85,
    transparent: true,
    refractionRatio: 0.85,
    vertexColors: THREE.VertexColors
  })
  const cubesInstance = new MarchingCubes(20, cubesMaterial, true, true)
  cubesInstance.position.set(0, 0, 0)
  cubesInstance.scale.set(30, 30, 30)
  scene.add(cubesInstance)

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

    const dt = 0.025

    F_gravity.copy(F_g)
      .applyAxisAngle(zAxis, Math.sin(nowSecs / 2))
      .applyAxisAngle(xAxis, Math.cos(nowSecs / 3))
    arrowHelper.setDirection(F_gravity.clone().normalize())

    // Rebuild neighbors list
    const cellAssign = particles.map(p => {
      for (let i = 0; i < cells.length; i += 1) {
        const cell = cells[i]
        const x = p.position.x >= cell[0] && p.position.x < cell[0] + 5
        const y = p.position.y >= cell[1] && p.position.y < cell[1] + 5
        // const z = p.position.z >= cell[2] && p.position.z < cell[2] + 10
        if (x && y) {
          return i
        }
      }
    })

    const neighbors = cellAssign.map((a, i) => {
      const nb = []
      cellAssign.map((b, j) => {
        if (i !== j && a === b) {
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
      // particles.map((p, i) => {
      //   p.f.copy(F_gravity)
      // })
    })

    // Calculate forces
    calcDensityPressure(particles, neighbors)
    calcForces(particles, neighbors)
    // particles.map((p, i) => {
    //   connectionsMap[i].map(cp => {
    //     calcF_spring(particles[i], particles[cp], k, restLength)
    //   })
    // })

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
    })

    cubesInstance.reset()

    particles.map(p => {
      cubesInstance.addBall(
        (p.position.x + 40) / 80,
        (p.position.y + 40) / 90,
        (p.position.z + 40) / 80,
        0.075,
        8,
        new THREE.Color(0x6699ff)
      )

      p.material.color.set(0xbbeeff)
      if (p.density > restDensity * 2) {
        p.material.color.set(0x01546c)
        // p.material.color.set(0xff0000)
      } else if (p.density > restDensity) {
        p.material.color.set(0x036fa1)
        // p.material.color.set(0xaa00aa)
      } else if (p.density > restDensity / 2) {
        p.material.color.set(0x09c3be)
      }

      // Handle Boundary Conditions
      const bounce = 0.1 * Math.random()
      if (p.position.x > domain[1]) {
        p.position.x = domain[1] - bounce
      } else if (p.position.x < -1 * domain[1]) {
        p.position.x = -1 * domain[1] + bounce
      }
      if (p.position.y > domain[1]) {
        p.position.y = domain[1] - bounce
      } else if (p.position.y < -1 * domain[1]) {
        p.position.y = -1 * domain[1] + bounce
      }
      if (p.position.z > domain[1]) {
        p.position.z = domain[1] - bounce
      } else if (p.position.z < -1 * domain[1]) {
        p.position.z = -1 * domain[1] + bounce
      }
    })

    const mousePosVec = new THREE.Vector2(lastMousePos.x, lastMousePos.y)
    raycaster.setFromCamera(mousePosVec, camera)
    const intersects = raycaster.intersectObjects(particles)
    if (label) {
      label.lookAt(camera.position)
    }

    if (intersects.length === 0 && label) {
      scene.remove(label)
      label = null
    } else if (intersects.length > 0) {
      const target = intersects[0]
      const { position, v, density, pressure } = target.object
      if (label) {
        scene.remove(label)
        label = null
      }
      label = createLabel({
        text: `Pos: (${position.x.toFixed(2)}, ${position.y.toFixed(
          2
        )})\nVel: (${v.x.toFixed(2)})\nDen: (${density.toFixed(
          2
        )})\nPrs: (${pressure.toFixed(2)})`,
        color: BLACK,
        size: gridSize / 2
      })
      label.position.set(
        target.object.position.x,
        target.object.position.y,
        target.object.position.z
      )
      const labelToCam = label.position.clone().sub(camera.position)
      labelToCam.normalize()
      label.position.sub(labelToCam.multiplyScalar(10))
      scene.add(label)
      label.lookAt(camera.position)
    }

    renderer.render(scene, camera)
  }
  animate()

  return () => {
    renderer.dispose()
    scene.dispose()
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
