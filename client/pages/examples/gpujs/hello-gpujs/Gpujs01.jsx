import React from 'react'
import _ from 'lodash'

import { default as utils, sq } from '-/utils'
import Example from '-Example'
import Markdown from '-/components/Markdown/Markdown'

import notes from './readme.md'
import './Gpujs01.scss'

const didMount = displayResult => {
  console.log('mount')
  const gpu = new GPU()

  const length = 64
  let setA = []
  let setB = []
  for (let n = 0; n < length; n++) {
    const randA = Math.random() * 100.0
    const randB = Math.random() * 100.0
    setA.push(randA)
    setB.push(randB)
  }

  const multiplyMatrix = gpu.createKernel(function(a, b) {
    let sum = 0
    for (let i = 0; i < 64; i++) {
      sum += a[this.thread.y][i] * b[i][this.thread.x]
    }
    return sum
  }).setDimensions([64, 64])

  const c = multiplyMatrix(setA, setB)

  displayResult(JSON.stringify(c, null, 2))
}

const Output = ({ id, output }) => {
  console.log('render output')
  return (
    <pre id={ id }>
      { JSON.stringify(output, null, 2) }
    </pre>
  )
}

const Computation = ({ id }) => {
  console.log('render computation')
  return (
    <div></div>
  )
}

const Gpujs0101 = ({ id, displayResult }, { store }) => {
  console.log('render 0101')
  return (
    <div>
      <Computation id={ id } onComponentShouldUpdate={ utils.shouldUpdate } onComponentDidMount={ () => didMount(displayResult) }/>
    </div>
  )
}

let lastResult = null
const Gpujs01 = (props, { store }) => {
  console.log('render')

  // const displayResult = result => {
  //   console.log('displayResult')
  //   store.select(sq('gpujs01.result')).set(result)
  // }

  // const result = JSON.stringify(store.select(sq('gpujs01.result')).get(), null, 2)
  // const components = {
  //   Gpujs0101: ({ id }) => {
  //     console.log('id', id)
  //     return (
  //       <Gpujs0101 id={ id }
  //         displayResult={ displayResult }
  //         onComponentShouldUpdate={ utils.shouldUpdate }
  //       />
  //     )
  //   },
  //   Gpujs0101Output: ({ id }) => {}
  // }
  return (
    <div class='gpujs01'>
      <Example
        notes={ notes }
        components={ components }
        onComponentShouldUpdate={ utils.shouldUpdate } />
    </div>
  )
}

export default ({ children }, { store }) => {
  return (
    <Gpujs01 />
  )
}
