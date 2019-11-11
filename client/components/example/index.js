import React from 'react'
import { compose, lifecycle, shouldUpdate } from 'recompose'
import compareProps from 'react-fast-compare'
import { css } from 'emotion'

import Markdown from '-/components/markdown'

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

const Example = ({ notes, components }) => {
  return (
    <div className={ style }>
      <Markdown text={ notes } components={ components } />
    </div>
  )
}

const enhance = compose(
  shouldUpdate((props, nextProps) => {
    if (props.shouldUpdate) {
      props.shouldUpdate(props, nextProps)
    }
    return true
  }),
  lifecycle({
    componentDidMount () {
      if (this.props.didMount) {
        this.props.didMount(this.props)
      }
    },
    componentDidUpdate () {
      if (this.props.didUpdate) {
        this.props.didUpdate(this.props)
      }
    }
  })
)

export default enhance(Example)
