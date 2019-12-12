import React from 'react'
import * as THREE from 'three'


import Example from '-/components/example'
import notes from './readme.md'

let rand = Math.random

const init = ({ canvas, container }) => {
  let renderer = new THREE.WebGLRenderer({ canvas })
  let scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )
  camera.position.z = 10
  camera.position.y = 5

 const randInt = () =>{
   return Math.floor(Math.random() * 10);
 }
  const size = 50;
  const divisions = 50;

  let gridHelper = new THREE.GridHelper( size, divisions );

  gridHelper.position.x=0
  gridHelper.position.y=0
  gridHelper.position.z=0

  scene.add( gridHelper );

  renderer.setSize(container.clientWidth, container.clientWidth)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 3, 5)
  scene.add(light)

  let sceneObjects = []

  for (let i = 0; i<20; i++){
    const sphere = new THREE.IcosahedronBufferGeometry(2, 1)
    const spheremesh = new THREE.Mesh(
      sphere,
      new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff })
    )
    spheremesh.position.x = 5 * randInt() - 25
    spheremesh.position.y = randInt()+1
    spheremesh.position.z = -2.5 * randInt()
    sceneObjects.push(spheremesh)
    scene.add(spheremesh)
  }

  let raycaster = new THREE.Raycaster()
  let mouse = new THREE.Vector2()
  let click = false
  const onMouseClick = (event) =>{

    console.log(event)    
    click = true
  }
  const onMouseMove = (event) =>{
    mouse.x = ( event.offsetX / canvas.clientWidth) * 2 - 1;
  	mouse.y = - ( event.offsetY / canvas.clientHeight ) * 2 + 1;
  }
  canvas.addEventListener( 'mousemove', onMouseMove, false );
  canvas.addEventListener( 'click', onMouseClick, false );
  const animate = () => {

    if(click){
      raycaster.setFromCamera( mouse, camera );
      let intersects = raycaster.intersectObjects( scene.children )
      for ( var i = 0; i < intersects.length; i++ ) {
          intersects[ i ].object.material.color.set( Math.random() * 0xffffff )
          console.log(intersects[i])
      }
      click = false
    }
    if (renderer) {
      requestAnimationFrame(animate)

      renderer.render(scene, camera)
    }

  }

animate()

return () => {
    renderer.dispose()
    scene.dispose()
    scene = null
    renderer = null
  }
}

const RayCasting = () => <Example notes={notes} init={init} />

export default React.memo(RayCasting)
