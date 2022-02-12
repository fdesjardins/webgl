import { css } from '@emotion/css'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import PropTypes from 'prop-types'

import { Header } from '../header/Header.js'
import { shadertoyInit } from '../../shadertoy.js'

const errorFallbackStyle = css`
  min-height: 100vh;
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  h1 {
    color: var(--red);
  }
  pre {
    background-color: var(--main-bg-color-dark);
    padding: 1em;
    border: 1px solid var(--font-color-dark);
    border-radius: 3px;
    color: var(--red);
    margin-bottom: 20%;
  }
`

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className={errorFallbackStyle} role="alert">
      <h1>{error.name}</h1>
      <br />
      <h2>{error.message}</h2>
      <br />
      <pre>{error.stack}</pre>
    </div>
  )
}

ErrorFallback.propTypes = {
  error: PropTypes.object,
  resetErrorBoundary: PropTypes.func,
}

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
    let scene, camera
    if (options.type === 'shadertoy') {
      const shaderToy = shadertoyInit({
        canvas,
        container,
        init,
        fs: options.shadertoy.fs,
        vs: options.shadertoy.vs,
      })
      scene = shaderToy.scene
      camera = shaderToy.camera
      dispose.push(shaderToy.dispose)
    }
    if (init) {
      dispose.push(init({ canvas, container, camera, scene }))
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
        className={options.display === 'fullscreen' ? fullscreenContainerStyle : ''}
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
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PageContent options={options} init={init} />
      </ErrorBoundary>
    </Suspense>
  )
}

Page.propTypes = {
  options: PropTypes.object,
  init: PropTypes.func,
}
