import React from 'react'

const UpDownLeftRight = ({ onLeft, onRight, onUp, onDown }) => {
  return (
    <div className="controls">
      <button className="left" onClick={onLeft}>
        left
      </button>
      <button className="up" onClick={onUp}>
        up
      </button>
      <button className="right" onClick={onRight}>
        right
      </button>
      <button className="down" onClick={onDown}>
        down
      </button>
    </div>
  )
}

export default UpDownLeftRight
