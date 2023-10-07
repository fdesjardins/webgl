import { css } from '@emotion/css'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import PropTypes from 'prop-types'

import { Header } from '../header/Header.js'
import { shadertoyInit } from '../../shadertoy.js'
import { ErrorBoundaryFallback } from '../error-boundary-fallback/ErrorBoundaryFallback'

const pageContentStyle = css`
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

const PageContent = ({ options, init }) => {
  React.useEffect(() => {
    const canvas = document.querySelector('canvas')
    const container = document.querySelector('#container')
    const dispose = []
    let scene, camera, controls, mesh
    if (options?.type === 'shadertoy') {
      const shaderToy = shadertoyInit({
        canvas,
        container,
        init,
        fs: options.shadertoy.fs,
        vs: options.shadertoy.vs,
        iChannel0: options.shadertoy.iChannel0,
      })
      scene = shaderToy.scene
      camera = shaderToy.camera
      controls = shaderToy.controls
      mesh = shaderToy.mesh
      dispose.push(shaderToy.dispose)
    }
    if (init) {
      dispose.push(init({ canvas, container, camera, controls, scene, mesh }))
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
    <main className={pageContentStyle}>
      <div
        id="container"
        className={options?.display === 'fullscreen' ? fullscreenContainerStyle : ''}
      >
        <canvas className="example" />
      </div>
    </main>
  )
}

PageContent.propTypes = {
  options: PropTypes.object,
  init: PropTypes.func,
}

export const Page = ({ options, init }) => {
  return (
    <Suspense fallback={<span>Loading</span>}>
      <Header key="header" />
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
        <PageContent options={options} init={init} />
      </ErrorBoundary>
    </Suspense>
  )
}

Page.propTypes = {
  options: PropTypes.object,
  init: PropTypes.func,
}
