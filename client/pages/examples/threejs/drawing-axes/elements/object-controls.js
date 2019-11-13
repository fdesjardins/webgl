import React from 'react'

export const RotationSpeed = ({ axisLabel, speed, setSpeed }) => (
  <div className="ui labeled small input">
    <div className="ui label">{axisLabel.toUpperCase()}</div>
    <input
      type="number"
      defaultValue={ speed }
      step="0.25"
      onChange={ ({ target }) => setSpeed(parseFloat(target.value)) }
    />
  </div>
)

export const ObjectRotation = ({ getSpeed, setSpeed }) => (
  <div className="field">
    <label>Rotation Speed</label>
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
  <div className="ui form object-properties">
    <ObjectRotation
      getSpeed={ axis => objectCursor.get([ 'rotationSpeed', axis ]) }
      setSpeed={ ({ axis, speed }) =>
        objectCursor.set([ 'rotationSpeed', axis ], speed)
      }
    />
  </div>
)

export default ObjectProperties
