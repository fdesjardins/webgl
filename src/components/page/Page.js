import { css } from '@emotion/css'
import React, { Suspense } from 'react'
import PropTypes from 'prop-types'

import { Header } from '../header/Header.js'
import { shadertoyInit } from '../../shadertoy.js'

const style = css`
  width: 100%;
  height: 100%;
  .stats {
    left: auto !important;
    right: 0;
    width: 90px;
    height: 55px;
    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  }
`

const fullscreenContainerStyle = css`
  height: 100vh !important;
  width: 100%;
  canvas.example {
    width: 100% !important;
    height: 100% !important;
  }
`

export const Page = ({ options, init }) => {
  React.useEffect(() => {
    const canvas = document.querySelector('canvas')
    const container = document.querySelector('#container')
    const dispose = []
    let scene
    if (options.type === 'shadertoy') {
      const shaderToy = shadertoyInit({
        canvas,
        container,
        init,
        fs: options.shadertoy.fs,
        vs: options.shadertoy.vs,
      })
      scene = shaderToy.scene
      dispose.push(shaderToy.dispose)
    }
    if (init) {
      dispose.push(init({ canvas, container, scene }))
    }
    return () => {
      for (const d of dispose) {
        if (typeof d === 'function') {
          d()
        }
      }
    }
  })

  return (
    <Suspense fallback={<span>Loading</span>}>
      <Header key="header" />
      <main className={style}>
        <div
          id="container"
          className={options.display === 'fullscreen' ? fullscreenContainerStyle : ''}
        >
          <canvas className="example" />
        </div>
      </main>
    </Suspense>
  )
}

Page.propTypes = {
  options: PropTypes.object,
  init: PropTypes.func,
}
