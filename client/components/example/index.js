import React from 'react'
import { css } from 'emotion'

import Markdown from '-/components/markdown'
import ErrorBoundary from '-/components/error-boundary'

// Default Example styles
const style = css`
  canvas {
    width: 100% !important;
    border-radius: 3px;
    margin-bottom: 15px;
  }

  .controls {
    margin-bottom: 15px;
  }
`

const Example = ({ notes, components, init, state = {}, id }) => {
  React.useEffect(() => {
    const canvas = id
      ? document.getElementById(id)
      : document.querySelector('canvas')
    const container = document.querySelector('.example-container')
    if (init) {
      const dispose = init({ canvas, container, state })
      return () => {
        dispose()
      }
    }
  })
  return (
    <ErrorBoundary>
      <div className={`${style} example-container`}>
        <Markdown text={notes} components={components} />
      </div>
    </ErrorBoundary>
  )
}

export default Example
