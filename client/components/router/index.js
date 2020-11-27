import React, { Suspense } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'

import examplesIndex from '-/examples-index'

import Home from '-/pages/home'

const Loading = () => (
  <div className="content text ui container">
    <div className="ui active centered inline loader text">Loading</div>
  </div>
)

const lazy = (Component) => (...args) => (
  <Suspense fallback={<Loading />}>
    <Component {...args} />
  </Suspense>
)

const Routes = (Layout) => () => (
  <BrowserRouter>
    <Layout>
      <Route exact path="/" component={Home} />
      {examplesIndex.map(({ slug, component }) => {
        return (
          <Route
            key={slug}
            path={`/examples/${slug}`}
            component={lazy(React.lazy(() => component))}
          />
        )
      })}
    </Layout>
  </BrowserRouter>
)

export default Routes
