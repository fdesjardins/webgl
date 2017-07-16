import Baobab from 'baobab'

import { sq } from '-/utils'

const state = new Baobab({
  app: {
    message: ''
  }
})

state.set('ex1', {
  scene: {
    pos: {
      x: 20,
      y: 20
    },
    color: [ Math.random(), Math.random(), Math.random(), 1 ],
    width: 50,
    height: 50
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

export default state
