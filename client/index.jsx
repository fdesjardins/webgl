import Inferno, { render } from 'inferno'
import createBrowserHistory from 'history/createBrowserHistory'
import { BrowserRouter, Route, IndexRoute } from 'inferno-router'

import initialState from '-/state/tree'
import Routes from '-/components/router'
import App from '-/components/app'
import Provider from '-/components/provider'

const initialize = (store, Routes) => {
  const browserHistory = createBrowserHistory()
  render(
    <BrowserRouter>
      <Routes store={initialState} browserHistory={browserHistory} />
    </BrowserRouter>,
    document.querySelector('#app')
  )
}
initialize(initialState, Routes)
