import React from 'react'
import { Link } from 'react-router-dom'

import CommandPalette from '-/components/controls/command-palette'

import './App.scss'

const App = ({ children }) => (
  <div className="app">
    <nav className="ui inverted segment">
      <div className="ui inverted secondary menu">
        <div className="ui container">
          <Link to="/" className="active item">
            Home
          </Link>
        </div>
      </div>
    </nav>
    <div className="content text ui container">{children || null}</div>
    <CommandPalette />
  </div>
)

export default App
