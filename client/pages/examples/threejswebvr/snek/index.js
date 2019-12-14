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
import {DeviceOrientationControls} from 'three/examples/jsm/controls/DeviceOrientationControls.js'
import { css } from 'emotion'


const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()
  let user = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
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

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  window.addEventListener( 'resize', onWindowResize, false );

  const button = VRButton.createButton(renderer)
  document.getElementById('webvr-button').appendChild(button)

  renderer.setSize(window.innerWidth, window.innerHeight)

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
  const roomsize = 400
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

  let pathBlock = new THREE.BoxBufferGeometry( 1, 3, 2.5 );

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
      camControls.lookSpeed = 0.01
  }
  let mycamera = false


  let camControls
  let mobile = false
  if(mobileCheck){

    camControls = new DeviceOrientationControls(user)
  }else{
    camControls = new FirstPersonControls(user, canvas)
  }

  const mobileCheck = ()=> {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check
  }

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
        if(mobile){
          camControls.update()
        }else{
          camControls.update(clock.getDelta())
        }
      }
      mycamera.getWorldDirection( lookvector )

      if(Math.abs(user.position.x)>=roomsize ||
        Math.abs(user.position.z)>=roomsize
         ){


          killMe()
       }else{
         user.position.x += lookvector.x * userVelocity

         user.position.z += lookvector.z * userVelocity
         if( distanceVector(lastPathBlock, user.position)>2){
           let pathHolder = new THREE.Mesh( pathBlock, pathmaterial )
           pathHolder.position.x = user.position.x- 2*lookvector.x
           pathHolder.position.y = 1.5//user.position.y
           pathHolder.position.z = user.position.z- 2*lookvector.z
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
  <div id="threejsvr02" className={`${style} `}>
    <span id="webvr-button" />
    <Example notes={notes} init={init} />
  </div>
)

const style = css`



.ui.container{
  max-width:100vw !important;
  margin-left:0;
  margin-right:0;
}

.content {
  margin-left:0;
  margin-right:0;

}
  canvas {
 position:fixed !important;
 top:60px;
 left:0px;

 width:100vw !important;

  }
  .ui.secondary.inverted.menu {
    display: inline-block;
`

export default Snek
