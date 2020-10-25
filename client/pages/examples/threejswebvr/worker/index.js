import React from 'react'
import * as THREE from 'three'
import { css } from 'emotion'
import * as Tone from 'tone'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js'
import Example from '-/components/example'
import droidSans from '-/assets/fonts/helvetiker_bold.typeface.json'
import notes from './readme.md'
//import Worker from 'worker-loader!./basic.worker.js'
import Worker from './basic.worker.js';

//import MyWorker from 'worker.js'

//import MyWorker from 'worker.js'




const globals = {
  fontLoader: new THREE.FontLoader(),
  font: null,
}

const state = {
  user: {
    alive: true,
    velocity: 1 / 10,
  },

}



const start = ({ canvas, container }) => {}

const init = async ({ canvas, container }) => {

  let scene = new THREE.Scene()
  const user = new THREE.Group()
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
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

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('resize', onWindowResize, false)

  const button = VRButton.createButton(renderer)
  document.getElementById('webvr-button').appendChild(button)
  renderer.setSize(window.innerWidth, window.innerHeight)

  const hand1 = renderer.xr.getController(0)
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



  const roomsize = 50
  const room = new THREE.LineSegments(
    new BoxLineGeometry(
      roomsize,
      roomsize,
      roomsize,
      roomsize ,
      roomsize ,
      roomsize
    ),
    new THREE.LineBasicMaterial({ color: 0x0080f0 })
  )
  room.geometry.translate(0, roomsize / 2, 0)
  // room.geometry.translate(0, 5, 0)
  scene.add(room)

  const light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 4, 0)
  scene.add(light)

  user.add(camera)
  scene.add(user)

  const lookvector = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()


  let mycamera = false
  let camControls = null

  const mobileCheck = () => {
    var check = false
    ;(function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true
    })(navigator.userAgent || navigator.vendor || window.opera)
    return check
  }

  const mobile = mobileCheck()
  if (mobile) {
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
    camControls.lookSpeed = 0
    camControls.movementSpeed = 1
    camControls.noFly = false
    camControls.lookVertical = true
    camControls.constrainVertical = false
    camControls.verticalMin = 0
    camControls.verticalMax = 5.0
    camControls.lon = -150
    camControls.lat = 120
    camControls.autoForward = false
  }


  const clock = new THREE.Clock()

  user.position.x = 75
  user.position.y = 20
  user.position.z = 0

  if (!mobile) {
    camControls.lookAt(0, 0, 0)
  }
//  const kernel = ({}) => {

    //var first = document.querySelector('input#number1');
    //var second = document.querySelector('input#number2');
    let sweatShop=[]


    const addChildWorker=()=>{
      console.log('putting child to work')
      let newChildWorker = new Worker();
      const workerBlock = new THREE.BoxBufferGeometry(
        3+2*Math.random(),
        3+2*Math.random(),
        3+2*Math.random())
      const workerMaterial = new THREE.MeshPhongMaterial({
        color: Math.random() * 0xffffff,
        opacity: 1,
        transparent: true,
      })
      const workerMesh = new THREE.Mesh(workerBlock, workerMaterial)
      newChildWorker.workerMesh = workerMesh
      newChildWorker.workerMesh.position.y = 5
      scene.add(newChildWorker.workerMesh)
      newChildWorker.onmessage = function(e) {
        if(!isNaN(e.data[0])){
            newChildWorker.workerMesh.position.x += e.data[0]*2
            newChildWorker.workerMesh.position.y += e.data[1]*2
            newChildWorker.workerMesh.position.z += e.data[2]*2
        }
        if (
          Math.abs(newChildWorker.workerMesh.position.x) >= roomsize / 2 ||
          newChildWorker.workerMesh.position.y >= roomsize + 2 ||
          newChildWorker.workerMesh.position.y < -2 ||
          Math.abs(newChildWorker.workerMesh.position.z) >= roomsize / 2
        ) {
          newChildWorker.terminate()
          console.log("a worker perished after escaping the factory ")

          sweatShop.splice(sweatShop.indexOf(newChildWorker), 1);
          // newChildWorker.workerMesh.material.emissive.r=newChildWorker.workerMesh.material.color.r
          // newChildWorker.workerMesh.material.emissive.g=newChildWorker.workerMesh.material.color.g
          // newChildWorker.workerMesh.material.emissive.b=newChildWorker.workerMesh.material.color.b

          newChildWorker.workerMesh.material.color.r=newChildWorker.workerMesh.material.color.r/3
          newChildWorker.workerMesh.material.color.r=newChildWorker.workerMesh.material.color.g/3
          newChildWorker.workerMesh.material.color.r=newChildWorker.workerMesh.material.color.b/3
          newChildWorker.workerMesh.material.opacity=0.5

          console.log(newChildWorker.workerMesh.material)
          //no leave him there as an example
          //scene.remove(newChildWorker)
        }
      }
      newChildWorker.onerror = function(error) {
        console.log('You mistreated your child worker: ' + error.message + '\n');
        console.log(error);
        throw error;
      };
      sweatShop.push(newChildWorker)
    }
    window.addEventListener("click", function(event) {
      addChildWorker()
    });


    addChildWorker();



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


      }
      for (const child of sweatShop){
          child.postMessage("get back to work!");
      }
      //childWorker.postMessage(childWorker.workerMesh.position.x)

      renderer.render(scene, camera)

      if (renderer.xr.isPresenting === true) {
        mycamera = renderer.xr.getCamera(camera)
        camControls.enabled = false
      } else {
        mycamera = camera
        if (mobile) {
          camControls.update()
        } else {
          camControls.update(clock.getDelta())
        }
      }
      mycamera.getWorldDirection(lookvector)
    })

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
 //kernel()
//}

const ChildWorker = ({ children }, { store }) => (
  <div id="threejsvr02" className={`${style} `}>
    <div id="hud" className="ui container">
      <span id="restart" className="active item">
        Click to add workers.
      </span>
    </div>
    <span id="webvr-button" />

    <Example notes={notes} init={init} />
  </div>
)

const style = css`
#hud{
  position:fixed !important;
  top:5px;
  right:5px;
  display:inline;
  z-index:100;
  width:200px;
  color:white;
}

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

export default ChildWorker
