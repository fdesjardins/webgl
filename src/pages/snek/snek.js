import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { FontLoader,Font } from 'three/examples/jsm/loaders/FontLoader'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import {isMobile, beep, onResize} from '../../utils.js'
import Stats from 'stats.js'
//import * as Tone from 'tone'
import {
  RenderPass,
  EffectComposer,
  EffectPass,
  BloomEffect,
  SMAAEffect,
  SMAAPreset,
  ShaderPass,
} from 'postprocessing'

import { DeviceOrientationControls } from './DeviceOrientationControls.js'
import inconsolataFont from '../../fonts/Inconsolata/Inconsolata_Regular.json'
//import nom from './nom.ogg'

const globals = {
  fontLoader: new FontLoader(),
  font: null,
  useSound:true,
  overheadMap:false

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

const config = {
  roomSize: 300,
  roomColor: 0x0080f0,
  isMobile: false
}
config.isMobile=isMobile()

/**
 * Create the game score
 */
const textMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
})
const createScore = (score, { size = 0.01 }) => {
  const textGeom = new TextGeometry(`Score: ${score}`, {
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
  const uiGeom = new THREE.PlaneGeometry(w, h)
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
    renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true })
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

  const handGeom = new THREE.IcosahedronGeometry(0.08, 1)
  handGeom.scale(0.2, 0.8, 1.5)
  const hand1Mat = new THREE.MeshLambertMaterial({
    color: Math.random() * 0xffffff,
  })
  const hand2Mat = new THREE.MeshLambertMaterial({
    color: Math.random() * 0xffffff,
    // flatShading: true,
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
export const init = ({ canvas, container }) => {
  const font = globals.fontLoader.parse(inconsolataFont)
  globals.font = font

  let { renderer } = createContextAndRenderer(canvas)
  renderer.setPixelRatio(window.devicePixelRatio)

  if (globals.useSound) {
    globals.context=new AudioContext();
    window.beep = beep
    window.context=globals.context
    setTimeout(function() {
        beep(globals.context, 200,100,20)
        setTimeout(function() {
            beep(globals.context, 400,100,20)
            setTimeout(function() {
              beep(globals.context, 600,100,20)
            }, 100)
          }, 100)
        }, 100)
  }

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

  const button = VRButton.createButton(renderer)
  container.appendChild(button)
  state.stats.showPanel(0)
  let scene = new THREE.Scene()
  const user = new THREE.Group()

  const userMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3),
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
    // updateScore(state.blockCount)
    state.user.alive = false
    state.user.velocity = 0
    user.position.x = 0
    user.position.y = 299
    user.position.z = 0
    if (!config.isMobile) {
      camControls.lookAt(0, 0, 0)
    }
    camControls.lookSpeed = 0.01
    if(globals.useSound){
      beep(globals.context, 100,1000,20)
    }
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
 const overheadRenderTarget = null
 const overheadViewMesh = null
if(globals.overheadMap){
  overheadRenderTarget = new THREE.WebGLRenderTarget(256, 256)
  overheadViewMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(
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

  const pathBlock = new THREE.BoxGeometry(1, 3, 2.5)
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

  const size = renderer.getDrawingBufferSize(new THREE.Vector2())
  //const renderTarget = new THREE.WebGLMultisampleRenderTarget(size.width, size.height)
const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height)
  const composer = new EffectComposer(renderer, renderTarget)
  // const copyPass = new ShaderPass(CopyShader)
  composer.addPass(new RenderPass(scene, camera))
  // composer.addPass(copyPass)
  // composer.addPass(new EffectPass(camera, new BloomEffect()))

  const animate = () => {
    if (!renderer) {
      return
    }


    state.stats.begin()

    if(globals.overheadMap){
      user.add(userMesh)
      room.material.color.setHex(0x000000)
      renderer.setRenderTarget(overheadRenderTarget)
      renderer.render(scene, overheadCam)
      user.remove(userMesh)
    }
    room.material.color.setHex(config.roomColor)
    renderer.setRenderTarget(null)
    renderer.render(scene, camera)
    composer.render()

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
    if (distanceVector(lastPathBlock, user.position) > 2 && state.user.alive) {
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

        if(globals.useSound){
          beep(window.context, 100,5,10)
        }

    }

    // Add a tasty egg to eat every now and then
    if (Math.random() < 0.005) {
      const egg = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2),
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
        if(globals.useSound){
          beep(globals.context, 600,100,20)
        }
        eggs.splice(eggs.indexOf(egg.object), 1)
        state.blockCount += 1
        state.user.velocity += 0.03
      }
    }
    // Move the eggs around to make them more tasty looking
    eggs.forEach((egg) => {
      egg.rotation.y += 0.1
      egg.position.y = user.position.y + 0.25 * Math.sin(clock.elapsedTime * 5)
    })

    lastUserPosition.copy(user.position)
    state.stats.end()
  }

  renderer.setAnimationLoop(animate)

  return () => {
    renderer.dispose()
    camControls.dispose()
    // stats.dispose()
    // document.removeChild(state.stats.dom)
    scene = null
    renderer = null
    window.removeEventListener('resize', handleResize)
  }
}
