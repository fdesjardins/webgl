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
    color: [Math.random(), Math.random(), Math.random(), 1],
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
      u_lightWorldPos: [10, 10, -10],
      u_lightColor: [1, 1, 1, 1],
      u_ambient: [0.2, 0.2, 0.2, 1],
      u_specular: [0.8, 0.8, 0.8, 1],
      u_shininess: 100,
      u_specularFactor: 10,
      u_diffuse: null,
      u_alpha: 0.7
    }
  }
})

state.set('ex7', {
  scene: {
    uniforms: {
      u_lightWorldPos: [10, 10, -10],
      u_lightColor: [0.2, 0.2, 0.2, 1],
      u_ambient: [0.2, 0.2, 0.2, 1],
      u_specular: [0.1, 0.1, 0.1, 1],
      u_shininess: 5,
      u_specularFactor: 5,
      u_diffuse: [0.2, 0.2, 0.2, 1],
      u_alpha: 0.7
    }
  }
})

state.set('gpujs01', {
  result: null
})

export default state
