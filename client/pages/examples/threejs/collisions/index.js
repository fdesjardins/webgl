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
    timestep: 1/60,
    iterations: 8,
    broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
    worldscale: 1,
    random: true,
    info:true // display statistique
  });
  let ground = world.add({size:[50, 10, 50], pos:[0,-5,0], density:1 });

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshLambertMaterial({ color: 0xaaff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 3, 5)
  scene.add(light)

  var i = 200, d, h, w, o;

  while( i-- ) {

      let w = rand(0.3,1);
      let h = rand(0.3,4);
      let d = rand(0.3,1);

      let o = {

          move:true,
          density:1,
          pos : [
              rand(-5,5),
              rand(2,10) + ( i*h ),
              rand(-5,5),
          ],
          rot : [
              randInt(0,360),
              randInt(0,360),
              randInt(0,360),
          ]

      };

      let rot = [
          randInt(0,360),
          randInt(0,360),
          randInt(0,360),
      ];

      switch( randInt(0,2) ){

          case 0 : o.type = 'sphere'; o.size = [w]; break;
          case 1 : o.type = 'box';  o.size = [w,w,d]; break;
          case 2 : o.type = 'cylinder'; o.size = [d,h,d]; break;

      }

      // see main.js
      world.add( o );

  }


  const animate = () => {
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
