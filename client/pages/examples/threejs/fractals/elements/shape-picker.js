import React from 'react'

const shapes = ['plane', 'sphere', 'cylinder', 'torus knot']

export const ShapePicker = ({ shape, setShape }) => (
  <select value={shape} className="ui dropdown" onChange={({ target }) => setShape(target.value)}>
    {shapes.map((f) => (
      <option key={f} value={f}>
        {f}
      </option>
    ))}
  </select>
)

export default ShapePicker
