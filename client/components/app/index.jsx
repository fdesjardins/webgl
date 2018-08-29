import React from 'react'
import { Link } from 'react-router-dom'

import CommandPalette from '-/components/controls/command-palette'

import './App.scss'

const App = ({ children }) => (
  <div className="app">
    <nav className="nav">
      <Link to="/">Home</Link>
    </nav>
    {/* <span class='flash-message'>
      { appCursor.get('message') }
    </span> */}
    <div className="content">{children || null}</div>
    <CommandPalette />
  </div>
)

export default App
