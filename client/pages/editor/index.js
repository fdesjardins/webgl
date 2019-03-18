import React from 'react'
import MonacoEditor from 'react-monaco-editor'
import { Treebeard } from 'react-treebeard'
import Baobab from 'baobab'
import { compose, withState, withHandlers, lifecycle } from 'recompose'
import { css } from 'emotion'
import * as THREE from 'three'

import Markdown from '-/components/markdown'

const projectStructure = {
  name: 'root',
  toggled: true,
  children: [
    {
      name: 'index.js',
      children: []
    }
  ]
}

const state = new Baobab({
  light: {
    color: 'ffffff',
    castShadow: true,
    shadow: {
      dispose: false,
      mapSize: {
        width: 1024,
        height: 1024
      }
    }
  },
  object: {
    color: 'ffffff',
    scale: [1.0, 1.0, 1.0],
    rotationSpeed: {
      x: 0.01,
      y: 0.01,
      z: 0.01
    }
  }
})

const notes = `
# Basics
`

const wrap = (Component, { ...first }) => ({ children, context, ...rest }) => (
  <Component {...first} {...rest}>
    {children}
  </Component>
)

const ColorPicker = ({ color, setColor }) => (
  <div className="field">
    <label>Light Color</label>
    <div className="ui labeled small input">
      <div className="ui label">Color</div>
      <input
        type="text"
        defaultValue={color}
        onChange={({ target }) => setColor(target.value)}
      />
    </div>
  </div>
)

const ObjectProperties = ({ objectCursor }) => (
  <div className="ui form object-properties">
    <ColorPicker
      color={objectCursor.get('color')}
      setColor={color => objectCursor.set('color', color)}
    />
  </div>
)

const components = {
  ObjectProperties: wrap(ObjectProperties, {
    objectCursor: state.select('object')
  })
}

const didMount = ({ canvas, container }) => {
  console.log('didMount')

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientWidth,
    0.1,
    1000
  )
  camera.position.z = 3

  const renderer = new THREE.WebGLRenderer({ canvas })

  renderer.setSize(container.clientWidth, container.clientWidth)
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0xaaff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const animate = () => {
    requestAnimationFrame(animate)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    cube.material.color.setHex(parseInt(state.get(['object', 'color']), 16))

    renderer.render(scene, camera)
  }
  animate()
}

const update = () =>
  didMount({
    canvas: document.querySelector('#canvas'),
    container: document.querySelector('.output')
  })

const Output = ({ text }) => <Markdown text={text} components={components} />

const style = css`
  position: absolute;
  left: 0;
  right: 0;
  top: 68px;
  bottom: 0;
  overflow: hidden;

  display: flex;
  flex: 1;

  .tree {
    flex: 0 0 20rem;
    padding: 0.5em;
    background-color: #21252b;
    > ul {
      height: 85%;
    }
    .controls {
      display: flex;
      flex-flow: row wrap;
      align-items: space-between;
      button {
        width: 75%;
        display: flex;
        flex-flow: row nowrap;
        margin-bottom: 0.5em;
      }
      button > span {
        margin-right: 0.5em;
      }
    }
  }

  .editor {
    flex: 0 0 calc(50% - 10rem);
  }

  .output {
    background: white;
    flex: 0 0 calc(50% - 10rem);
    padding: 1em;
    overflow-y: auto;
  }

  canvas {
    max-width: 100%;
  }
`

const Editor = ({ text, onRun, onEditorChange }) => {
  return (
    <div className={style}>
      <div className="tree">
        <Treebeard data={projectStructure} />
        <div className="controls">
          <button className="ui button" onClick={onRun}>
            <span>▶</span> Run
          </button>
          <button className="ui button">
            <span>↶</span> Reset
          </button>
          <button className="ui button">
            <span>+</span> Add Cell
          </button>
          <button className="ui button">
            <span>-</span> Remove Cell
          </button>
        </div>
      </div>
      <div className="editor">
        <MonacoEditor
          height="100%"
          language="markdown"
          theme="vs-dark"
          defaultValue={text}
          options={{
            lineNumbers: 'off',
            minimap: {
              enabled: false
            }
          }}
          onChange={onEditorChange}
        />
      </div>
      <div className="output">
        <Output text={text} />
      </div>
    </div>
  )
}

const initialText = `
# Hello Three.js

---

> The aim of the project is to create an easy to use, lightweight, 3D library. The library provides <canvas>, <svg>, CSS3D and WebGL renderers.
>
> --[https://github.com/mrdoob/three.js/](https://github.com/mrdoob/three.js/)

<ObjectProperties color="ffffff"/>

<canvas id="canvas"/>
`

const enhance = compose(
  withState('innerText', 'setInnerText', initialText),
  withState('text', 'setText', initialText),
  withHandlers({
    onEditorChange: ({ setInnerText }) => data => setInnerText(data),
    onRun: ({ setText, innerText }) => () => {
      console.log('running...', innerText)
      setText(innerText)
    }
  }),
  lifecycle({
    componentDidUpdate() {
      update()
    },
    componentDidMount() {
      update()
    }
  })
)

export default enhance(Editor)
