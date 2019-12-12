import React from 'react'
import ReactDOM from 'react'
import * as THREE from 'three'
//import 'three/examples/js/vr/HelioWebXRPolyfill.js'
import Example from '-/components/example'
import notes from './readme.md'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
//import { CylinderBufferGeometry } from 'three/examples/jsm/geometries/CylinderBufferGeometry.js'
import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls.js'

const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()
  let user = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )

  camera.position.x = 0
  camera.position.y = 2
  camera.position.z = 0

  camera.rotation.x = 0
  camera.rotation.y = 0

  // force webgl2 context (for oculus quest compat)
  const context = canvas.getContext('webgl2', { alpha: false })

  let renderer = new THREE.WebGLRenderer({ canvas, context })
  renderer.vr.enabled = true
  const button = VRButton.createButton(renderer)
  document.getElementById('webvr-button').appendChild(button)

  renderer.setSize(container.clientWidth, container.clientWidth)

  const hand1 = renderer.vr.getController(0)
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

  const hand2 = renderer.vr.getController(1)
  // hand2.addEventListener( 'selectstart', onSelectStart );
  // hand2.addEventListener( 'selectend', onSelectEnd );
  scene.add(hand2)
  const hand2mesh = new THREE.Mesh(
    hand,
    new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff,
      flatShading: true
    })
  )
  hand2mesh.position.x = hand2.position.x
  hand2mesh.position.y = hand2.position.y
  hand2mesh.position.z = hand2.position.z

  user.add(hand1mesh)
  user.add(hand2mesh)

  scene.add(user)
  const roomsize = 200
  const room = new THREE.LineSegments(
    new BoxLineGeometry(roomsize, roomsize, roomsize, roomsize, roomsize, roomsize),
    new THREE.LineBasicMaterial({ color: 0x0080f0 })
  )
  room.geometry.translate(0, roomsize/2, 0)
  scene.add(room)

  const light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 4, 0)
  scene.add(light)

  user.add(camera)
  scene.add(user)

  let lookvector = new THREE.Vector3()

  let pathBlock = new THREE.BoxBufferGeometry( 1, 3, 2 );

  let pathmaterial = new THREE.MeshPhongMaterial( {
    color: 0x00ff00,
    opacity: 0.5,
  transparent: true,} );

  let lastPos = new THREE.Vector3()
  lastPos.x =user.position.x
  lastPos.y =user.position.y
  lastPos.z =user.position.z

  let lastPathBlock = new THREE.Vector3()
  let lastUserPosition = new THREE.Vector3()
  lastPathBlock.copy(user.position)
  lastUserPosition.copy(user.position)
  let userVelocity = 1/10
const distanceVector =( v1, v2 ) =>{
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

  let raycaster = new THREE.Raycaster()

  const killMe = () =>{
    user.position.x =0
    user.position.y =175
    user.position.z =0
    userVelocity = 0
    camControls.lookAt(0,0,0)
    //camControls.enabled=false;
  }
  let mycamera = false

  let camControls = new FirstPersonControls(user, canvas)

  camControls.lookSpeed = 0.8
  camControls.movementSpeed = 0
  camControls.noFly = true
  camControls.lookVertical = false
  camControls.constrainVertical = false
  camControls.verticalMin = 0
  camControls.verticalMax = 5.0
  camControls.lon = -150
  camControls.lat = 120
  camControls.autoForward= false

  let clock = new THREE.Clock()

  const animate = () => {
    renderer.setAnimationLoop(() => {
      if (!renderer) {
        return
      }
      let cameraWorldPos = new THREE.Vector3()
      camera.getWorldPosition(cameraWorldPos)
      let cameraWorldDir = new THREE.Vector3()
      camera.getWorldDirection(cameraWorldDir)
      raycaster.set( cameraWorldPos, cameraWorldDir )
      let intersects = raycaster.intersectObjects( scene.children )
      for ( var i = 0; i < intersects.length; i++ ) {
          //console.log(intersects[i])
          if(intersects[i].distance < .2){

            killMe()
          }
      }

      renderer.render(scene, camera)

      hand1mesh.position.copy(hand1.position)


      hand2mesh.position.copy(hand2.position)


      hand1mesh.quaternion.copy(hand1.quaternion)


      hand2mesh.quaternion.copy(hand2.quaternion)


      try{
      mycamera = renderer.vr.getCamera(camera)
      camControls.enabled=false;
      }catch(ex){
        mycamera = camera
        camControls.update(clock.getDelta())
      }
      mycamera.getWorldDirection( lookvector )

      if(Math.abs(user.position.x)>=roomsize ||
        Math.abs(user.position.z)>=roomsize
         ){


          killMe()
       }else{
         user.position.x += lookvector.x * userVelocity
         //user.position.y += lookvector.y/5
         user.position.z += lookvector.z * userVelocity
         if( distanceVector(lastPathBlock, user.position)>1.9){
           let pathHolder = new THREE.Mesh( pathBlock, pathmaterial )
           pathHolder.position.x = user.position.x- lookvector.x
           pathHolder.position.y = 1.5//user.position.y
           pathHolder.position.z = user.position.z- lookvector.z
           if(!camControls.enabled){
             pathHolder.quaternion.copy(mycamera.quaternion)

           }else{
             pathHolder.quaternion.copy(user.quaternion)

         }

           scene.add(pathHolder)
           lastPathBlock.copy(user.position)
         }
       }
       lastUserPosition.copy(user.position)
       userVelocity *=1.001

    })

    renderer.render(scene, camera)
    lastPos = user.position
  }
  animate()

  return () => {
    renderer.dispose()
    scene.dispose()
    scene = null
    renderer = null
  }
}

const Snek = ({ children }, { store }) => (
  <div id="threejsvr02">
    <span id="webvr-button" />
    <Example notes={notes} init={init} />
  </div>
)

export default Snek
