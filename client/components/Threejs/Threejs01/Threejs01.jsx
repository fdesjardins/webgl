import Inferno from 'inferno'
 import { default as utils, sq } from '-/utils'
import './Threejs01.scss'


const init =({})=>{
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  camera.position.z = 5;
}

const Threejs01 = ({ init}) => {

  var animate = function () {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;

    renderer.render(scene, camera);
  };

  return(

    <h1> Hello World </h1>

  )
}
export default ({ children }, { store }) => {
  const subscribe = callback => {
    store.select(sq('Threejs01.scene')).on('update', ({ data }) => callback(data.currentData))
  }
  return (
    <Threejs01
      subscribe={ subscribe }
    />
  )
}
