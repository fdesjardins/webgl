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
  minWorkers:10,

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

  const clock = new THREE.Clock()

  user.position.x = -50
  user.position.y = 60
  user.position.z = -50

    camControls.lookAt(0, 0, 0)
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
      newChildWorker.workerMesh.position.y = roomsize / 2
      scene.add(newChildWorker.workerMesh)
      newChildWorker.onmessage = function(e) {
        if(!isNaN(e.data[0])){
            newChildWorker.workerMesh.position.x += e.data[0]*2
            newChildWorker.workerMesh.position.y += e.data[1]*2
            newChildWorker.workerMesh.position.z += e.data[2]*2
            newChildWorker.workerMesh.rotation.x += e.data[3]*.5
            newChildWorker.workerMesh.rotation.y += e.data[4]*.5
            newChildWorker.workerMesh.rotation.z += e.data[5]*.5

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

          newChildWorker.workerMesh.material.color.r=newChildWorker.workerMesh.material.color.r
          newChildWorker.workerMesh.material.color.g=newChildWorker.workerMesh.material.color.g
          newChildWorker.workerMesh.material.color.b=newChildWorker.workerMesh.material.color.b
          newChildWorker.workerMesh.material.opacity=0.5

          //console.log(newChildWorker.workerMesh.material)
          //no leave him there as an example to the others
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

      if(sweatShop.length<=state.minWorkers){
        console.log("we're low on workers, get another one.")
        addChildWorker()}
      //childWorker.postMessage(childWorker.workerMesh.position.x)

      renderer.render(scene, camera)

      if (renderer.xr.isPresenting === true) {
        mycamera = renderer.xr.getCamera(camera)
        camControls.enabled = false
      } else {
        mycamera = camera

          camControls.update(clock.getDelta())

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
