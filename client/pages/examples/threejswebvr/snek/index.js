import React from 'react'
import * as THREE from 'three'
import { css } from 'emotion'
import * as Tone from 'tone'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js'
// import { CylinderBufferGeometry } from 'three/examples/jsm/geometries/CylinderBufferGeometry.js'

import Example from '-/components/example'
import droidSans from '-/assets/fonts/helvetiker_bold.typeface.json'
import nom from '-/assets/nom.ogg'
import notes from './readme.md'
import { isMobileDevice } from '-/utils'
import Stats from 'stats.js'
const globals = {
  fontLoader: new THREE.FontLoader(),
  font: null,
  audioListener: new THREE.AudioListener(),
  audioLoader: new THREE.AudioLoader(),
}

const config = {
  roomSize: 300,
  roomColor: 0x0080f0,
  isMobile: isMobileDevice(),
}

const state = {
  user: {
    alive: true,
    velocity: 1 / 10,
  },
  score: {
    value: 0,
    mesh: null,
  },
  blockCount: 0,
  ui: {
    mesh: null,
    width: null,
    height: null,
  },
  stats: new Stats(),
}

/**
 * Create the game score
 */
const textMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
})
const createScore = (score, { size = 0.01 }) => {
  const textGeom = new THREE.TextBufferGeometry(`Score: ${score}`, {
    font: globals.font,
    size,
    height: 1e-5,
  })
  const textMesh = new THREE.Mesh(textGeom, textMat)
  return textMesh
}

/**
 * Determine a world-space location from NDC coords for drawing UI elements
 */
const uiToWorld = (canvas, camera, uiMesh, xy) => {
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(xy.x, xy.y), camera)
  const intersections = raycaster.intersectObject(uiMesh)
  if (intersections.length < 1) {
    return null
  }
  return intersections[0].point
}
/**
 * Create a transparent plane at a given distance to serve as the UI plane
 */
const createUiPlane = (canvas, camera, distance = 0.11) => {
  const aspect = canvas.clientWidth / canvas.clientHeight
  const vfov = (camera.fov * Math.PI) / 180
  const h = 2 * Math.tan(vfov / 2) * distance
  const w = h * aspect
  const uiGeom = new THREE.PlaneBufferGeometry(w, h)
  const uiMat = new THREE.MeshBasicMaterial({
    color: 0xffaaaa,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.0,
  })
  const uiMesh = new THREE.Mesh(uiGeom, uiMat)
  uiMesh.position.z = -distance
  return uiMesh
}

const createContextAndRenderer = (canvas) => {
  // force webgl2 context (for oculus quest compat)
  const context = canvas.getContext('webgl2', { alpha: false })

  let renderer = null
  try {
    context.makeXRCompatible()
    renderer = new THREE.WebGLRenderer({ canvas, context })
    renderer.xr.enabled = true
  } catch {
    renderer = new THREE.WebGLRenderer({ canvas, context })
    renderer.xr.enabled = false
  }
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  return { context, renderer }
}

const createVRHands = (xr) => {
  const hand1 = xr.getController(0)
  const hand2 = xr.getController(1)
  // hand1.addEventListener( 'selectstart', onSelectStart );
  // hand1.addEventListener( 'selectend', onSelectEnd );
  // hand2.addEventListener( 'selectstart', onSelectStart );
  // hand2.addEventListener( 'selectend', onSelectEnd );

  const handGeom = new THREE.IcosahedronBufferGeometry(0.08, 1)
  handGeom.scale(0.2, 0.8, 1.5)
  const hand1Mat = new THREE.MeshLambertMaterial({
    color: Math.random() * 0xffffff,
  })
  const hand2Mat = new THREE.MeshLambertMaterial({
    color: Math.random() * 0xffffff,
    flatShading: true,
  })

  const hand1Mesh = new THREE.Mesh(handGeom, hand1Mat)
  hand1Mesh.position.set(hand1.position.x, hand1.position.y, hand1.position.z)
  const hand2Mesh = new THREE.Mesh(handGeom, hand2Mat)
  hand2Mesh.position.set(hand2.position.x, hand2.position.y, hand2.position.z)

  return { hand1, hand2, hand1Mesh, hand2Mesh }
}

const createControls = (user, canvas) => {
  if (config.isMobile) {
    console.log('mobile detected')
    const controls = new DeviceOrientationControls(user)
    controls.lookSpeed = 0.4
    controls.movementSpeed = 4
    controls.noFly = true
    controls.lookVertical = true
    controls.constrainVertical = true
    controls.verticalMin = 1.0
    controls.verticalMax = 2.0
    controls.lon = -150
    controls.lat = 120
    return controls
  }
  console.log('mouselook')
  const controls = new FirstPersonControls(user, canvas)
  controls.lookSpeed = 0.3
  controls.movementSpeed = 0
  controls.noFly = false
  controls.lookVertical = false
  controls.constrainVertical = false
  controls.verticalMin = 0
  controls.verticalMax = 5.0
  controls.lon = -150
  controls.lat = 120
  controls.autoForward = false
  return controls
}

// to test localhost on a mobile device use :
// adb reverse tcp:9090 tcp:9090
const init = ({ canvas, container }) => {
  const font = globals.fontLoader.parse(droidSans)
  globals.font = font

  const sound = new THREE.Audio(globals.audioListener)
  globals.audioLoader.load(nom, (b) => {
    sound.setBuffer(b)
    sound.setVolume(0.5)
  })

  const { renderer } = createContextAndRenderer(canvas)

  window.synth = new Tone.Synth().toDestination()
  const distortion = new Tone.Distortion(0.4).toDestination()
  window.synth.connect(distortion)
  window.synth.triggerAttackRelease('C5', '8n')

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 1, 0)
  camera.rotation.set(0, 0, 0)

  const overheadCam = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  )
  overheadCam.position.set(0, 195, -1)
  overheadCam.lookAt(0, 0, 0)

  const button = VRButton.createButton(renderer)
  document.getElementById('webvr-button').appendChild(button)
  state.stats.showPanel(0)
  // state.stats.showPanel(2)
  document.body.appendChild(state.stats.dom)
  let scene = new THREE.Scene()
  const user = new THREE.Group()

  const userMesh = new THREE.Mesh(
    new THREE.IcosahedronBufferGeometry(3),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  )
  user.add(userMesh)

  const { hand1, hand2, hand1Mesh, hand2Mesh } = createVRHands(renderer.xr)
  scene.add(hand1)
  scene.add(hand2)
  user.add(hand1Mesh)
  user.add(hand2Mesh)

  const rs = config.roomSize
  const room = new THREE.LineSegments(
    new BoxLineGeometry(rs, rs, rs, rs / 2, rs / 2, rs / 2),
    new THREE.LineBasicMaterial({ color: config.roomColor })
  )
  room.geometry.translate(0, rs / 2, 0)
  scene.add(room)

  const light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 4, 0)
  scene.add(light)

  user.add(camera)
  scene.add(user)
  user.position.y = 2

  const camControls = createControls(user, canvas)

  const killMe = () => {
    updateScore(state.blockCount)
    state.user.alive = false
    state.user.velocity = 0
    user.position.x = 0
    user.position.y = 299
    user.position.z = 0
    if (!config.isMobile) {
      camControls.lookAt(0, 0, 0)
    }
    camControls.lookSpeed = 0.01
    window.synth.triggerAttackRelease('E5', '8n')
  }
  let mycamera = false

  let uiMesh = createUiPlane(canvas, camera)
  camera.add(uiMesh)

  renderer.render(scene, camera)

  const updateScore = (score) => {
    if (state.score.mesh) {
      uiMesh.remove(state.score.mesh)
      state.score.mesh.geometry.dispose()
      state.score.mesh.material.dispose()
      state.score.mesh = null
    }
    const scoreMesh = createScore(String(score), { size: 0.006 })
    const scorePos = uiMesh.worldToLocal(
      uiToWorld(canvas, camera, uiMesh, {
        x: -0.95,
        y: 0.88,
      })
    )
    scoreMesh.position.copy(scorePos)
    state.score.mesh = scoreMesh
    state.score.value = score
    uiMesh.add(scoreMesh)
  }

  const overheadRenderTarget = new THREE.WebGLRenderTarget(256, 256)
  const overheadViewMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(
      (0.04 / 950) * canvas.clientWidth,
      (0.04 / 950) * canvas.clientWidth
    ),
    new THREE.MeshBasicMaterial({
      map: overheadRenderTarget.texture,
    })
  )
  const overheadViewPos = uiMesh.worldToLocal(
    uiToWorld(canvas, camera, uiMesh, {
      x: 0.75,
      y: 0.7,
    })
  )
  uiMesh.add(overheadViewMesh)
  overheadViewMesh.position.copy(overheadViewPos)

  const onWindowResize = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
    if (renderer) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    }
    if (uiMesh) {
      camera.remove(uiMesh)
      uiMesh = createUiPlane(canvas, camera)
      camera.add(uiMesh)
    }
  }
  window.addEventListener('resize', onWindowResize, false)

  // Example of how to use mouseclick to get UI positions
  // canvas.addEventListener('mousedown', (event) => {
  //   console.log(event.clientX - canvas.offsetLeft)
  //   console.log(event.clientY - canvas.offsetTop)
  //   const scorePos = uiMesh.worldToLocal(
  //     uiToWorld(canvas, camera, uiMesh, {
  //       x: event.clientX - canvas.offsetLeft,
  //       y: event.clientY - canvas.offsetTop,
  //     })
  //   )
  //   console.log('scorePos', scorePos)
  //   scorePos.z = 0
  //   scoreMesh.position.copy(scorePos)
  // })

  const pathBlock = new THREE.BoxBufferGeometry(1, 3, 2.5)
  const pathmaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    opacity: 0.5,
    transparent: true,
  })

  let lastBlock = null
  const lastPathBlock = new THREE.Vector3()
  const lastUserPosition = new THREE.Vector3()
  lastPathBlock.copy(user.position)
  lastUserPosition.copy(user.position)
  const distanceVector = (v1, v2) => {
    const dx = v1.x - v2.x
    const dy = v1.y - v2.y
    const dz = v1.z - v2.z

    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }
  lastPathBlock.copy(user.position)

  const clock = new THREE.Clock()
  const lookvector = new THREE.Vector3()
  const cameraWorldPos = new THREE.Vector3()
  const cameraWorldDir = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()
  const pathHolders = []
  const eggs = []

  const animate = () => {
    renderer.setAnimationLoop(() => {
      state.stats.begin()
      if (!renderer) {
        return
      }
      user.add(userMesh)
      room.material.color.setHex(0x000000)
      renderer.setRenderTarget(overheadRenderTarget)
      renderer.render(scene, overheadCam)
      user.remove(userMesh)
      room.material.color.setHex(config.roomColor)
      renderer.setRenderTarget(null)
      renderer.render(scene, camera)

      // Update VR Hand Meshes
      hand1Mesh.position.copy(hand1.position)
      hand2Mesh.position.copy(hand2.position)
      hand1Mesh.quaternion.copy(hand1.quaternion)
      hand2Mesh.quaternion.copy(hand2.quaternion)

      // Update controls
      if (renderer.xr.isPresenting === true) {
        mycamera = renderer.xr.getCamera(camera)
        camControls.enabled = false
      } else {
        // updateScore(state.blockCount)
        mycamera = camera
        if (config.isMobile) {
          camControls.update()
        } else {
          camControls.update(clock.getDelta())
        }
      }

      // Update user position
      mycamera.getWorldDirection(lookvector)
      user.position.x += lookvector.x * state.user.velocity
      // user.position.y += lookvector.y * state.user.velocity
      user.position.z += lookvector.z * state.user.velocity

      // GAMEOVER: You're already dead
      if (!state.user.alive) {
        return
      }
      // GAMEOVER: The player collides with the wall
      if (
        Math.abs(user.position.x) >= config.roomSize / 2 ||
        user.position.y >= config.roomSize + 2 ||
        user.position.y < -2 ||
        Math.abs(user.position.z) >= config.roomSize / 2
      ) {
        killMe()
      }
      // GAMEOVER: The player collides with an existing block
      camera.getWorldPosition(cameraWorldPos)
      camera.getWorldDirection(cameraWorldDir)
      raycaster.set(cameraWorldPos, cameraWorldDir)
      for (const i of raycaster.intersectObjects(pathHolders)) {
        if (i.distance < state.user.velocity) {
          if (i.object !== lastBlock) {
            i.object.material = new THREE.MeshPhongMaterial({
              color: 0xff0000,
              opacity: 0.5,
              transparent: true,
            })
            state.user.velocity = 0
            killMe()
          }
        }
      }

      // Advance forward and add a new path segment
      if (
        distanceVector(lastPathBlock, user.position) > 2 &&
        state.user.alive
      ) {
        const pathHolder = new THREE.Mesh(pathBlock, pathmaterial)
        pathHolder.position.set(
          user.position.x - 2 * lookvector.x,
          user.position.y - 2 * lookvector.y,
          user.position.z - 2 * lookvector.z
        )
        if (!camControls.enabled) {
          pathHolder.quaternion.copy(mycamera.quaternion)
        } else {
          pathHolder.quaternion.copy(user.quaternion)
        }
        lastBlock = pathHolder
        scene.add(pathHolder)
        pathHolders.push(pathHolder)
        if (pathHolders.length >= state.blockCount * 10) {
          scene.remove(pathHolders[0])
          pathHolders.shift()
        }
        lastPathBlock.copy(user.position)
        try {
          window.synth.triggerAttackRelease('E3', '.00001')
        } catch {}
      }

      // Add a tasty egg to eat every now and then
      if (Math.random() < 0.005) {
        const egg = new THREE.Mesh(
          new THREE.IcosahedronBufferGeometry(2),
          new THREE.MeshLambertMaterial({ color: 0xff00ff })
        )
        egg.position.set(
          user.position.x + 20 * lookvector.x,
          user.position.y + 20 * lookvector.y,
          user.position.z + 20 * lookvector.z
        )
        scene.add(egg)
        eggs.push(egg)
      }

      // GULP: We ate an egg!
      for (const egg of raycaster.intersectObjects(eggs)) {
        if (egg.distance < state.user.velocity + 1) {
          scene.remove(egg.object)
          sound.play()
          eggs.splice(eggs.indexOf(egg.object), 1)
          state.blockCount += 1
          state.user.velocity += 0.03
        }
      }
      // Move the eggs around to make them more tasty looking
      eggs.forEach((egg) => {
        egg.rotation.y += 0.1
        egg.position.y =
          user.position.y + 0.25 * Math.sin(clock.elapsedTime * 5)
      })

      lastUserPosition.copy(user.position)
      state.stats.end()
    })
  }
  animate()

  return () => {
    renderer.dispose()
    scene = null
  }
}

const Snek = (_, { store }) => (
  <div id="threejsvr02" className={`${style} `}>
    <span id="webvr-button" />
    <Example notes={notes} init={init} />
  </div>
)

const style = css`
  canvas {
    position: fixed;
    top: 68px;
    left: 0px;
    width: 100vw;
    height: calc(100vh - 68px) !important;
  }
`

export default Snek
