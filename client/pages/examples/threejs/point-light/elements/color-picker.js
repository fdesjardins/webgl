import React from 'react'

export const ColorPicker = ({ color, setColor }) => (
  <div className="field">
    <label>Light Color</label>
    <div className="ui labeled small input">
      <div className="ui label">Color</div>
      <input
        type="text"
        defaultValue={ color }
        onChange={ ({ target }) => setColor(target.value) }
      />
    </div>
  </div>
)

export default ColorPicker
