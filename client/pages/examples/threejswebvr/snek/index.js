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
import notes from './readme.md'
import { isMobileDevice } from '-/utils'

const globals = {
  fontLoader: new THREE.FontLoader(),
  font: null,
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

// to test localhost on a mobile device use :
// adb reverse tcp:9090 tcp:9090
const init = ({ canvas, container }) => {
  const font = globals.fontLoader.parse(droidSans)
  globals.font = font

  // window.synth = new Tone.Synth().toMaster()
  // const distortion = new Tone.Distortion(0.4).toMaster()
  // window.synth.connect(distortion)
  // window.synth.triggerAttackRelease('C5', '8n')

  let scene = new THREE.Scene()
  const user = new THREE.Group()
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  )

  camera.position.x = 0
  camera.position.y = 1
  camera.position.z = 0

  camera.rotation.x = 0
  camera.rotation.y = 0

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

  const button = VRButton.createButton(renderer)
  document.getElementById('webvr-button').appendChild(button)
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  const hand1 = renderer.xr.getController(0)
  // hand1.addEventListener( 'selectstart', onSelectStart );
  // hand1.addEventListener( 'selectend', onSelectEnd );
  scene.add(hand1)

  const hand = new THREE.IcosahedronBufferGeometry(0.08, 1)
  hand.scale(0.2, 0.8, 1.5)

  const hand1mesh = new THREE.Mesh(
    hand,
    new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
  )

  hand1mesh.position.x = hand1.position.x
  hand1mesh.position.y = hand1.position.y
  hand1mesh.position.z = hand1.position.z

  const hand2 = renderer.xr.getController(1)
  // hand2.addEventListener( 'selectstart', onSelectStart );
  // hand2.addEventListener( 'selectend', onSelectEnd );
  scene.add(hand2)
  const hand2mesh = new THREE.Mesh(
    hand,
    new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff,
      flatShading: true,
    })
  )
  hand2mesh.position.x = hand2.position.x
  hand2mesh.position.y = hand2.position.y
  hand2mesh.position.z = hand2.position.z

  user.add(hand1mesh)
  user.add(hand2mesh)

  scene.add(user)

  const roomsize = 300
  const room = new THREE.LineSegments(
    new BoxLineGeometry(
      roomsize,
      roomsize,
      roomsize,
      roomsize / 2,
      roomsize / 2,
      roomsize / 2
    ),
    new THREE.LineBasicMaterial({ color: 0x0080f0 })
  )
  room.geometry.translate(0, roomsize / 2, 0)
  scene.add(room)

  const light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 4, 0)
  scene.add(light)

  user.add(camera)
  scene.add(user)

  const lookvector = new THREE.Vector3()

  const pathBlock = new THREE.BoxBufferGeometry(1, 3, 2.5)

  const pathmaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    opacity: 0.5,
    transparent: true,
  })

  let lastPos = new THREE.Vector3()
  lastPos.x = user.position.x
  lastPos.y = user.position.y
  lastPos.z = user.position.z
  let lastBlock = null
  const lastPathBlock = new THREE.Vector3()
  const lastUserPosition = new THREE.Vector3()
  lastPathBlock.copy(user.position)
  lastUserPosition.copy(user.position)
  const distanceVector = (v1, v2) => {
    var dx = v1.x - v2.x
    var dy = v1.y - v2.y
    var dz = v1.z - v2.z

    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  const raycaster = new THREE.Raycaster()

  const isMobile = isMobileDevice()

  const killMe = () => {
    state.user.alive = false
    state.user.velocity = 0
    user.position.x = 0
    user.position.y = 299
    user.position.z = 0
    // updateScore(user, state.blockCount)
    if (!isMobile) {
      camControls.lookAt(0, 0, 0)
    }
    camControls.lookSpeed = 0.01
    // window.synth.triggerAttackRelease("E5", "8n");
    // setTimeout(function(){ window.location='/examples/threejswebvr/02' }, 10000);
  }
  let mycamera = false
  let camControls = null

  user.position.y = 2

  if (isMobile) {
    console.log('mobile detected')
    camControls = new DeviceOrientationControls(user)
    camControls.lookSpeed = 0.4
    camControls.movementSpeed = 4
    camControls.noFly = true
    camControls.lookVertical = true
    camControls.constrainVertical = true
    camControls.verticalMin = 1.0
    camControls.verticalMax = 2.0
    camControls.lon = -150
    camControls.lat = 120
  } else {
    console.log('mouselook')
    camControls = new FirstPersonControls(user, canvas)
    camControls.lookSpeed = 0.3
    camControls.movementSpeed = 0
    camControls.noFly = false
    camControls.lookVertical = false
    camControls.constrainVertical = false
    camControls.verticalMin = 0
    camControls.verticalMax = 5.0
    camControls.lon = -150
    camControls.lat = 120
    camControls.autoForward = false
  }

  const clock = new THREE.Clock()
  lastPathBlock.copy(user.position)

  let uiMesh = createUiPlane(canvas, camera)
  camera.add(uiMesh)
  // renderer.render(scene, camera)

  const updateScore = (score) => {
    if (state.score.mesh) {
      uiMesh.remove(state.score.mesh)
      state.score.mesh = null
    }
    const scoreMesh = createScore(String(score), { size: 0.0065 })
    const scorePos = uiMesh.worldToLocal(
      uiToWorld(canvas, camera, uiMesh, {
        x: -0.95,
        y: 0.85,
      })
    )
    state.score.mesh = scoreMesh
    state.score.value = score
    uiMesh.add(scoreMesh)
    scoreMesh.position.copy(scorePos)
  }

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

  const animate = () => {
    renderer.setAnimationLoop(() => {
      if (!renderer) {
        return
      }

      const cameraWorldPos = new THREE.Vector3()
      camera.getWorldPosition(cameraWorldPos)
      const cameraWorldDir = new THREE.Vector3()
      camera.getWorldDirection(cameraWorldDir)
      raycaster.set(cameraWorldPos, cameraWorldDir)
      const intersects = raycaster.intersectObjects(scene.children)
      for (var i = 0; i < intersects.length; i++) {
        if (intersects[i].distance < state.user.velocity) {
          if (
            intersects[i].object !== room &&
            intersects[i].object !== lastBlock
          ) {
            intersects[i].object.material = new THREE.MeshPhongMaterial({
              color: 0xff0000,
              opacity: 0.5,
              transparent: true,
            })
            console.log(lastBlock)
            console.log(intersects[i].object)
            state.user.velocity = 0
            killMe()
          }
        }
      }
      if (
        Math.abs(user.position.x) >= roomsize / 2 ||
        user.position.y >= roomsize + 2 ||
        user.position.y < -2 ||
        Math.abs(user.position.z) >= roomsize / 2
      ) {
        killMe()
      }

      renderer.render(scene, camera)
      hand1mesh.position.copy(hand1.position)
      hand2mesh.position.copy(hand2.position)
      hand1mesh.quaternion.copy(hand1.quaternion)
      hand2mesh.quaternion.copy(hand2.quaternion)

      if (renderer.xr.isPresenting === true) {
        mycamera = renderer.xr.getCamera(camera)
        camControls.enabled = false
      } else {
        mycamera = camera
        if (isMobile) {
          camControls.update()
        } else {
          camControls.update(clock.getDelta())
        }
      }
      mycamera.getWorldDirection(lookvector)

      updateScore(state.blockCount)
      user.position.x += lookvector.x * state.user.velocity
      // user.position.y += lookvector.y * state.user.velocity
      user.position.z += lookvector.z * state.user.velocity
      if (
        distanceVector(lastPathBlock, user.position) > 2 &&
        state.user.alive
      ) {
        const pathHolder = new THREE.Mesh(pathBlock, pathmaterial)
        pathHolder.position.x = user.position.x - 2 * lookvector.x
        pathHolder.position.y = user.position.y - 2 * lookvector.y
        pathHolder.position.z = user.position.z - 2 * lookvector.z
        if (!camControls.enabled) {
          pathHolder.quaternion.copy(mycamera.quaternion)
        } else {
          pathHolder.quaternion.copy(user.quaternion)
        }
        state.blockCount++
        lastBlock = pathHolder
        scene.add(pathHolder)
        lastPathBlock.copy(user.position)

        // window.synth.triggerAttackRelease('E3', '.00001')
      }

      lastUserPosition.copy(user.position)
      state.user.velocity *= 1.001
    })

    renderer.render(scene, camera)
    lastPos = user.position
  }
  animate()

  return () => {
    renderer.dispose()
    scene = null
    renderer = null
  }
}

const Snek = ({ children }, { store }) => (
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
