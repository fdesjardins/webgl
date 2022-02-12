import * as THREE from 'three'

import vs from './vs.glsl'
import fs from './fs.glsl'

export const meta = {
  title: 'Greek Temple',
  tags: 'threejs,ray marching',
  slug: 'greek-temple',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    vs,
    fs,
  },
}

export const init = ({ container, camera, scene }) => {
  scene.add(new THREE.GridHelper(100, 60, new THREE.Color(0x666666), new THREE.Color(0x222222)))
  camera.position.set(26, 7.5, -36)
  camera.lookAt(0, 0, 0)
  const cameraPosInterval = setInterval(() => {
    console.log(camera.position)
  }, 2000)
  return () => {
    clearInterval(cameraPosInterval)
  }
}
