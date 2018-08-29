import React from 'react'

import ColorPicker from './color-picker'

const ShadowProperties = ({ getShadows, setShadows }) => (
  <div className="form-group">
    <label>Shadows</label>
    <div className="input-group">
      <div className="input-group-prepend">
        <span className="input-group-text">Resolution</span>
      </div>
      <input
        className="form-control"
        type="number"
        defaultValue={ getShadows().mapSize.width }
        min="0"
        max="64"
        onChange={ ({ target }) =>
          setShadows({ mapSize: { width: target.value } })
        }
      />
    </div>
  </div>
)

const LightProperties = ({ lightCursor }) => (
  <div>
    <ColorPicker
      color={ lightCursor.get('color') }
      setColor={ color => lightCursor.set('color', color) }
    />
    <ShadowProperties
      getShadows={ () => lightCursor.get('shadow') }
      setShadows={ properties => {
        lightCursor.merge('shadow', properties)
        lightCursor.set([ 'shadow', 'dispose' ], true)
      } }
    />
  </div>
)

export default LightProperties
