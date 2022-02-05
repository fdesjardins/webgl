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

export const init = ({ scene }) => {
  scene.add(new THREE.GridHelper(100, 60, new THREE.Color(0x666666), new THREE.Color(0x222222)))
}
