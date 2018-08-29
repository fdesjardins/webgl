import React from 'react'

import ColorPicker from './color-picker'

export const ScalePicker = ({ axisLabel, scale, setScale }) => (
  <div className="input-group">
    <div className="input-group-prepend">
      <span className="input-group-text">{axisLabel.toUpperCase()}</span>
    </div>
    <input
      className="form-control"
      type="number"
      defaultValue={ scale }
      onChange={ ({ target }) => setScale(parseFloat(target.value)) }
    />
  </div>
)

export const ObjectScale = ({ getScale, setScale }) => (
  <div className="form-group">
    <label>Scale</label>
    <ScalePicker
      axisLabel="x"
      scale={ getScale('x') }
      setScale={ scale => setScale({ axis: 'x', scale }) }
    />
    <ScalePicker
      axisLabel="y"
      scale={ getScale('y') }
      setScale={ scale => setScale({ axis: 'y', scale }) }
    />
    <ScalePicker
      axisLabel="z"
      scale={ getScale('z') }
      setScale={ scale => setScale({ axis: 'z', scale }) }
    />
  </div>
)

export const RotationSpeed = ({ axisLabel, speed, setSpeed }) => (
  <div className="input-group">
    <div className="input-group-prepend">
      <span className="input-group-text">{axisLabel.toUpperCase()}</span>
    </div>
    <input
      className="form-control"
      type="number"
      defaultValue={ speed }
      step="0.005"
      onChange={ ({ target }) => setSpeed(parseFloat(target.value)) }
    />
  </div>
)

export const ObjectRotation = ({ getSpeed, setSpeed }) => (
  <div className="form-group">
    <label>Rotation</label>
    <RotationSpeed
      axisLabel="x"
      speed={ getSpeed('x') }
      setSpeed={ speed => setSpeed({ axis: 'x', speed }) }
    />
    <RotationSpeed
      axisLabel="y"
      speed={ getSpeed('y') }
      setSpeed={ speed => setSpeed({ axis: 'y', speed }) }
    />
    <RotationSpeed
      axisLabel="z"
      speed={ getSpeed('z') }
      setSpeed={ speed => setSpeed({ axis: 'z', speed }) }
    />
  </div>
)

export const ObjectProperties = ({ objectCursor }) => (
  <div className="object-properties">
    <ColorPicker
      color={ objectCursor.get('color') }
      setColor={ color => objectCursor.set('color', color) }
    />
    <ObjectScale
      getScale={ axis => objectCursor.get([ 'scale', { x: 0, y: 1, z: 2 }[axis] ]) }
      setScale={ ({ axis, scale }) =>
        objectCursor.set([ 'scale', { x: 0, y: 1, z: 2 }[axis] ], scale)
      }
    />
    <ObjectRotation
      getSpeed={ axis => objectCursor.get([ 'rotationSpeed', axis ]) }
      setSpeed={ ({ axis, speed }) =>
        objectCursor.set([ 'rotationSpeed', axis ], speed)
      }
    />
  </div>
)

export default ObjectProperties
