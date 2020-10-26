import React from 'react'

import ColorPicker from './color-picker'

const ShadowProperties = ({ getShadows, setShadows }) => (
  <div className="field">
    <label>Shadows</label>
    <div className="ui labeled small input">
      <div className="ui label">Pixels</div>
      <input
        type="number"
        defaultValue={getShadows().mapSize.width}
        min="0"
        max="64"
        onChange={({ target }) =>
          setShadows({ mapSize: { width: target.value } })
        }
      />
    </div>
  </div>
)

const LightProperties = ({ lightCursor }) => (
  <div className="ui form light-properties">
    <ColorPicker
      color={lightCursor.get('color')}
      setColor={(color) => lightCursor.set('color', color)}
    />
    <ShadowProperties
      getShadows={() => lightCursor.get('shadow')}
      setShadows={(properties) => {
        lightCursor.merge('shadow', properties)
        lightCursor.set(['shadow', 'dispose'], true)
      }}
    />
  </div>
)

export default LightProperties
