import React from 'react'
import * as THREE from 'three'
import Baobab from 'baobab'
import { css } from 'emotion'

import Example from '-/components/example'
import notes from './readme.md'
import BasicsOrtho from './elements/basics-ortho'
import BasicsPersp from './elements/basics-persp'
import VectorField from './elements/vector-field'
import VectorFieldInput from './elements/vector-field-input'
import Oscilloscope from './elements/oscilloscope'
import Pendulum from './elements/pendulum'
import ForceDirectedGraph from './elements/force-directed-graph'
import SPH from './elements/sph'

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

const style = css`
  canvas {
    max-width: 100%;
  }
`

const GraphingExample = () => (
  <div className={`${style} example-class`}>
    <Example
      notes={notes}
      components={{
        BasicsOrtho: React.memo(wrap(BasicsOrtho, { state })),
        BasicsPersp: React.memo(wrap(BasicsPersp, { state })),
        VectorField: React.memo(wrap(VectorField, { state })),
        VectorFieldInput: React.memo(wrap(VectorFieldInput, { state })),
        Oscilloscope: React.memo(wrap(Oscilloscope, { state })),
        Pendulum: React.memo(wrap(Pendulum, { state })),
        ForceDirectedGraph: React.memo(wrap(ForceDirectedGraph, { state })),
        SPH: React.memo(wrap(SPH, { state }))
      }}
      init={init}
    />
  </div>
)

export default GraphingExample
