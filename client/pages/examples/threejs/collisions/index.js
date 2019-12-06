import React from 'react'
import * as THREE from 'three'
import * as OIMO from 'oimo'

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
  camera.position.z = 3

 const randInt = () =>{
   return Math.floor(Math.random() * 10);
 }
  let world = new OIMO.World({
    timestep: 1/30,
    iterations: 8,
    broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
    worldscale: 1,
    random: true,
    info:true,
    gravity: [0,-9.8,0]

  });
  let ground = world.add({size:[50, 10, 50], pos:[0,-2,0], density:1 });
  var size = 1000;
  var divisions = 1000;

  var gridHelper = new THREE.GridHelper( size, divisions );
  scene.add( gridHelper );
  gridHelper.position.copy(ground.getPosition())

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshLambertMaterial({ color: 0xaaff00 })
  const cube = new THREE.Mesh(geometry, material)
  //scene.add(cube)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 3, 5)
  scene.add(light)

  let body1 = world.add({
      type:'sphere', // type of shape : sphere, box, cylinder
      size:[1,1,1], // size of shape
      pos:[0,0,0], // start position in degree
      rot:[0,0,90], // start rotation in degree
      move:true, // dynamic or statique
      density: 1,
      friction: 0.2,
      restitution: 0.2,
      belongsTo: 1, // The bits of the collision groups to which the shape belongs.
      collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
  });


  world.step();

  const sphere = new THREE.IcosahedronBufferGeometry(0.08, 1)
  //hand.scale(0.2, 0.8, 1.5)

  const spheremesh = new THREE.Mesh(
    sphere,
    new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
  )
scene.add(spheremesh)


  const animate = () => {
    spheremesh.position.copy(body1.getPosition())
    spheremesh.quaternion.copy( body1.getQuaternion() )
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
    if (renderer) {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

  }
  world.postLoop = animate
  world.play();

  //animate()

  return () => {
    renderer.dispose()
    scene.dispose()
    scene = null
    renderer = null
  }
}

const Collisions = () => <Example notes={notes} init={init} />

export default React.memo(Collisions)
