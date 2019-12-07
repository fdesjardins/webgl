import React from 'react'
import ReactDOM from 'react'
import * as THREE from 'three'
import 'three/examples/js/vr/HelioWebXRPolyfill.js'
import Example from '-/components/example'
import notes from './readme.md'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'

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
  const geometry = new THREE.BoxGeometry(100, 100, 100)
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff })



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
  // hand1mesh.scale.x = 0.1
  // hand1mesh.scale.y = 0.1
  // hand1mesh.scale.z = 0.1
  hand1mesh.position.x = hand1.position.x
  hand1mesh.position.y = hand1.position.y
  hand1mesh.position.z = hand1.position.z

  //scene.add(hand1mesh)

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
  // hand1mesh.scale.x = 0.1
  // hand1mesh.scale.y = 0.1
  // hand1mesh.scale.z = 0.1

  hand2mesh.position.x = hand2.position.x
  hand2mesh.position.y = hand2.position.y
  hand2mesh.position.z = hand2.position.z
  //scene.add(hand2mesh)

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

  console.log(renderer.vr)

  let pathBlock = new THREE.BoxBufferGeometry( 1, 5, 1 );
  let pathmaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
  let cube = new THREE.Mesh( pathBlock, pathmaterial );
  let path=[]

  let lastPos = new THREE.Vector3()
  lastPos.x =user.position.x
  lastPos.y =user.position.y
  lastPos.z =user.position.z

  let lastPathBlock = new THREE.Vector3()
  lastPathBlock.copy(user.position)
const distanceVector =( v1, v2 ) =>{
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}
  const animate = () => {
    renderer.setAnimationLoop(() => {
      if (!renderer) {
        return
      }
      renderer.render(scene, camera)
      hand1mesh.position.x = hand1.position.x
      hand1mesh.position.y = hand1.position.y
      hand1mesh.position.z = hand1.position.z

      hand2mesh.position.x = hand2.position.x
      hand2mesh.position.y = hand2.position.y
      hand2mesh.position.z = hand2.position.z

      hand1mesh.quaternion.w = hand1.quaternion.w
      hand1mesh.quaternion.x = hand1.quaternion.x
      hand1mesh.quaternion.y = hand1.quaternion.y
      hand1mesh.quaternion.z = hand1.quaternion.z

      hand2mesh.quaternion.w = hand2.quaternion.w
      hand2mesh.quaternion.x = hand2.quaternion.x
      hand2mesh.quaternion.y = hand2.quaternion.y
      hand2mesh.quaternion.z = hand2.quaternion.z

      let mycamera = renderer.vr.getCamera(camera)
      mycamera.getWorldDirection( lookvector )

      if(Math.abs(user.position.x)>=roomsize/2 ||
        Math.abs(user.position.z)>=roomsize/2
         ){
          user.position.x =0
          user.position.y =0
          user.position.z =0
       }else{
         user.position.x += lookvector.x/5
         //user.position.y += lookvector.y/5
         user.position.z += lookvector.z/5


         console.log(distanceVector(lastPathBlock, user.position))
         if( distanceVector(lastPathBlock, user.position)>1){
           let pathHolder = new THREE.Mesh( pathBlock, pathmaterial )
           pathHolder.position.x = user.position.x
           pathHolder.position.y = user.position.y
           pathHolder.position.z = user.position.z

           path.push(pathHolder)
           scene.add(pathHolder)
           lastPathBlock.copy(user.position)
         }
       }


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

const VRInput = ({ children }, { store }) => (
  <div id="threejsvr01">
    <span id="webvr-button" />
    <Example notes={notes} init={init} />
  </div>
)

export default VRInput
