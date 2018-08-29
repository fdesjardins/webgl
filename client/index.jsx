import React from 'react'
import { render } from 'react-dom'
import createBrowserHistory from 'history/createBrowserHistory'
import { BrowserRouter, Route, IndexRoute } from 'react-router-dom'
import { root } from 'baobab-react/higher-order'

import state from '-/state/tree'
import Routes from '-/components/router'

const initialize = Routes => {
  const browserHistory = createBrowserHistory()
  render(
    <BrowserRouter>
      <Routes browserHistory={ browserHistory } />
    </BrowserRouter>,
    document.querySelector('#app')
  )
}
initialize(root(state, Routes))
