import Baobab from 'baobab'

import { sq } from '-/utils'

const state = new Baobab({
  app: {
    message: '',
    query: '',
    querySelectedIndex: 0
  }
})

state.set('ex1', {
  scene: {
    pos: {
      x: 50,
      y: 50
    },
    color: [ Math.random(), Math.random(), Math.random(), 1 ],
    width: 75,
    height: 75
  },
  controls: {
    moveLeft: d => {
      state.select(sq('ex1.scene.pos.x')).apply(x => x - d)
    },
    moveRight: d => {
      state.select(sq('ex1.scene.pos.x')).apply(x => x + d)
    },
    moveUp: d => {
      state.select(sq('ex1.scene.pos.y')).apply(y => y - d)
    },
    moveDown: d => {
      state.select(sq('ex1.scene.pos.y')).apply(y => y + d)
    }
  }
})

state.select(sq('ex1.scene.pos')).on('update', ({ target }) => {
  state.select('app').set('message', `pos: ${JSON.stringify(target)}`)
})

state.set('ex5', {
  scene: {
    uniforms: {
      u_lightWorldPos: [7, 7, -7],
      u_lightColor: [1, 1, 1, 1],
      u_ambient: [0, 0, 0, 1],
      u_specular: [1, 1, 1, 1],
      u_shininess: 50,
      u_specularFactor: 1,
      u_diffuse: null
    }
  }
})

window.baobabLog = []

state.on('update', e => baobabLog.push(e))

export default state
