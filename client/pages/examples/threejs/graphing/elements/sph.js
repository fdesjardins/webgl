import React from 'react'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'

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

const calcF_spring = (obj1, obj2, k, restLength) => {
  const d = obj1.position.clone().sub(obj2.position)
  const l = d.length()
  const F_spring = d.normalize().multiplyScalar(-1 * k * (l - restLength))
  return F_spring
}

const restDensity = 1
const gasConstant = 2000
const h = 16
const hsq = h ** 2
const mass = 20000
const viscosity = 250
const F_gravity = new THREE.Vector3(0, -0.0981, 0)
const poly6 = 315 / (64 * Math.PI * h ** 9)
const spiky = -45 / (Math.PI * h ** 6)

const calcDensityPressure = (particle, particles) => {
  particle.rho = 0
  particles.map(pj => {
    const rij = pj.position.clone().sub(particle.position)
    const rij2 = rij.clone().dot(rij)
    if (rij2 < hsq) {
      particle.rho += mass * poly6 * (hsq - rij2) ** 3
    }
  })
  particle.pressure = gasConstant * (particle.rho - restDensity)
}

const calcForces = (particle, particles) => {
  const F_pressure = new THREE.Vector3(0, 0, 0)
  const F_viscosity = new THREE.Vector3(0, 0, 0)
  const F = new THREE.Vector3(0, 0, 0)

  particles.map((pj, j) => {
    if (particle === pj) {
      return
    }
    const rij = pj.position.clone().sub(particle.position)
    const r = rij.length()

    if (r < h) {
      // console.log('here')
      rij
        .normalize()
        .multiplyScalar(
          ((-1 * mass * (particle.pressure + pj.pressure)) / (2 * pj.rho)) *
            spiky *
            (h - r) ** 2
        )
      F_pressure.add(rij)
      // F_viscosity.add()
    }
  })

  F.add(F_gravity.clone().multiplyScalar(particle.rho))
  F.add(F_pressure)

  particle.f = F
}

const init = ({ state }) => {
  const canvas = document.getElementById('sph')
  let scene = new THREE.Scene()
  scene.background = new THREE.Color(WHITE)
  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const domain = [-5, 5]
  const gridSize = 0.35
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
  const g = -0.0981
  const restLength = 3
  const k = 0.01
  const numParticles = 200
  const numToAdd = 5
  const particleSize = gridSize / 2

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
      const len = particles.length
      connectionsMap[len] = []
      connectionsMap.map((_, j) => {
        connectionsMap[j].push(len)
        connectionsMap[len].push(j)
      })
      particles.push(p)
      scene && scene.add(p)
    })

    n += numToAdd
    if (n >= numParticles) {
      clearInterval(interval)
    }
  }, 40)

  const tempPos = new THREE.Vector3()
  const tempDir = new THREE.Vector3()
  const F_g = new THREE.Vector3(0, g, 0)
  const F_net = new THREE.Vector3(0, g, 0)
  const zAxis = new THREE.Vector3(0, 0, 1)
  let thenSecs = 0
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

    F_gravity.copy(F_g.clone().applyAxisAngle(zAxis, nowSecs * 0.2))
    arrowHelper.setDirection(F_gravity.clone().normalize())

    particles.map((p, i) => {
      p.lookAt(camera.position)

      // F_net.copy(gravity)

      // Calculate forces
      calcDensityPressure(p, particles)
      // connectionsMap[i].map(cp => {
      //   p.f = tempDir
      //     .clone()
      //     .add(calcF_spring(particles[i], particles[cp], k, restLength))
      // })
    })

    particles.map((p, i) => {
      calcForces(p, particles)
    })

    particles.map((p, i) => {
      // F_net.copy(calcForces(particles[i], particles))

      tempPos.copy(p.position)
      tempPos.multiplyScalar(2).sub(p.lastPosition)
      tempPos.add(p.f.multiplyScalar((deltaSecs / 128) ** 2))

      p.lastPosition.copy(p.position)
      p.position.copy(tempPos)

      const bounce = 0.05 * Math.random()
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
    }
    if (intersects.length > 0) {
      const target = intersects[0]
      const pos = target.object.position
      if (label) {
        scene.remove(label)
        label = null
      }
      label = createLabel({
        text: `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`,
        color: BLACK,
        size: gridSize / 2
      })
      label.position.set(
        target.object.position.x,
        target.object.position.y,
        target.object.position.z
      )
      label.lookAt(camera.position)
      const labelToCam = label.position.clone().sub(camera.position)
      labelToCam.normalize()
      label.position.sub(labelToCam.multiplyScalar(10))
      scene.add(label)
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
