import React from 'react'

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

export default UpDownLeftRight
