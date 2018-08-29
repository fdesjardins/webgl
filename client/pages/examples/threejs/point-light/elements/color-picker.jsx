import React from 'react'

export const ColorPicker = ({ color, setColor }) => (
  <div className="input-group">
    <div className="input-group-prepend">
      <span className="input-group-text">Color</span>
    </div>
    <input
      className="form-control"
      type="text"
      defaultValue={ color }
      onChange={ ({ target }) => setColor(target.value) }
    />
  </div>
)

export default ColorPicker
