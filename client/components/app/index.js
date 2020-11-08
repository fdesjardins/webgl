import React from 'react'
import { Link } from 'react-router-dom'
import { root } from 'baobab-react/higher-order'
import { css } from 'emotion'

import state from '-/state/tree'
import Routes from '-/components/router'

const style = css`
  nav {
    border-radius: 0 !important;
    position: fixed !important;
    top: 0;
    left: 0;
    right: 0;
    z-index: 99;
  }
  .content {
    padding: 150px 0;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
`

const Layout = ({ children }) => (
  <div className={`app ${style}`}>
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
  </div>
)

export default root(state, Routes(Layout))
