import React from 'react'
import * as THREE from 'three'
import Baobab from 'baobab'
import { css } from 'emotion'

import Example from '-/components/example'
import notes from './readme.md'
import BasicsOrtho, { init as init1 } from './elements/basics-ortho'
import BasicsPersp, { init as init2 } from './elements/basics-persp'

const state = new Baobab({
  light: {
    color: 'ffffff',
    castShadow: true,
    shadow: {
      dispose: false,
      mapSize: {
        width: 1024,
        height: 1024
      }
    }
  },
  object: {
    color: 'ffffff',
    scale: [1.0, 1.0, 1.0],
    rotationSpeed: {
      x: 0.0,
      y: 0.5,
      z: 0.5
    },
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    }
  }
})

const init = () => {
  // const dispose1 = init1()
  // const dispose2 = init2()
  return () => {
    // dispose1()
    // dispose2()
  }
}

const wrap = (Component, { ...first }) => ({ children, context, ...rest }) => (
  <Component {...first} {...rest}>
    {children}
  </Component>
)

const style = css``

const GraphingExample = () => (
  <div className={`${style} example-class`}>
    <Example
      notes={notes}
      components={{
        BasicsOrtho: wrap(BasicsOrtho, { state }),
        BasicsPersp: wrap(BasicsPersp, { state })
      }}
      init={init}
    />
  </div>
)

export default GraphingExample
