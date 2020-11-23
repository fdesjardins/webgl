import React from 'react'
import PropTypes from 'prop-types'

const UpDownLeftRight = ({ onLeft, onRight, onUp, onDown }) => {
  return (
    <div className="controls">
      <button className="ui button" onClick={onLeft}>
        left
      </button>
      <button className="ui button" onClick={onRight}>
        right
      </button>
      <button className="ui button" onClick={onUp}>
        up
      </button>
      <button className="ui button" onClick={onDown}>
        down
      </button>
    </div>
  )
}

UpDownLeftRight.propTypes = {
  onLeft: PropTypes.func,
  onRight: PropTypes.func,
  onUp: PropTypes.func,
  onDown: PropTypes.func
}

export default UpDownLeftRight
