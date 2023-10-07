import { HashRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import propTypes from 'prop-types'
import * as ss from 'superstruct'

// eslint-disable-next-line import/no-unresolved
import * as pages from './pages/*/index.js'
import { Home } from './pages/home/Home'
import { Page } from './components/page/Page'
import { ErrorBoundaryFallback } from './components/error-boundary-fallback/ErrorBoundaryFallback'

const pageIndex = Object.keys(pages)
  .map((key) => ({ key, ...pages[key] }))
  .filter((x) => !!x.meta)
  .sort((a, b) => a.meta.title.localeCompare(b.meta.title))

const PageIndex = ss.array(
  ss.object({
    key: ss.string(),
    meta: ss.object({
      tags: ss.string(),
      title: ss.string(),
      slug: ss.optional(ss.string()),
      component: ss.optional(ss.object()),
      fullscreen: ss.optional(ss.boolean()),
    }),
    options: ss.optional(
      ss.object({
        display: ss.string(),
        type: ss.optional(ss.string()),
        shadertoy: ss.optional(ss.object()),
      })
    ),
    init: ss.optional(ss.func()),
  })
)

const Router = ({ children }) => {
  ss.assert(pageIndex, PageIndex)
  return (
    <HashRouter>
      {children || null}
      <Routes>
        <Route path="/" element={<Home pageIndex={pageIndex} />} />
        {pageIndex.map(({ key, meta, options, init }) => (
          <Route
            key={meta.slug ?? key}
            path={meta.slug ?? key}
            element={<Page meta={meta} options={options} init={init} />}
          />
        ))}
      </Routes>
    </HashRouter>
  )
}

Router.propTypes = {
  children: propTypes.object,
}

const RouterWithErrorBoundary = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
    <Router>{children}</Router>
  </ErrorBoundary>
)

export { RouterWithErrorBoundary as Router }

RouterWithErrorBoundary.propTypes = {
  children: propTypes.object,
}
