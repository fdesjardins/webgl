import React, { Suspense } from 'react'
import propTypes from 'prop-types'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// eslint-disable-next-line import/no-unresolved
import * as pages from './pages/*/index.js'
import { Home } from './pages/home/Home'

const pageIndex = Object.keys(pages)
  .map((key) => pages[key].meta)
  .filter((x) => !!x)
  .sort((a, b) => a.title.localeCompare(b.title))

const lazyPages = pageIndex.map(({ slug, component }) => ({
  slug,
  Page: React.lazy(() => component),
}))

export const Router = ({ children }) => (
  <BrowserRouter>
    {children || null}
    <Routes>
      <Route path="/" element={<Home pageIndex={pageIndex} />} />
      {lazyPages.map(({ slug, Page }) => (
        <Route
          path={slug}
          element={
            <Suspense fallback={<span>Loading</span>}>
              <Page />
            </Suspense>
          }
          key={slug}
        />
      ))}
    </Routes>
  </BrowserRouter>
)

Router.propTypes = {
  children: propTypes.object,
}
