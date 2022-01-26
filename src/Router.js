import React, { Suspense } from 'react'
import propTypes from 'prop-types'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// eslint-disable-next-line import/no-unresolved
import * as pages from './pages/*/index.js'
import { Home } from './pages/home/Home'
import { Header } from './components/header/Header.js'

const pageIndex = Object.keys(pages)
  .map((key) => pages[key])
  .filter((x) => !!x.meta)
  .sort((a, b) => a.meta.title.localeCompare(b.meta.title))

// const lazyPages = pageIndex.map(({ meta, init }) => ({
//   meta

// }))

const Example = ({ init }) => {
  React.useEffect(() => {
    const canvas = document.querySelector('canvas')
    const container = document.querySelector('#container')
    if (init) {
      const dispose = init({ canvas, container })
      return () => {
        if (typeof dispose === 'function') {
          dispose()
        }
      }
    }
  })
  return (
    <>
      <div id="container">
        <canvas className="example" />
      </div>
    </>
  )
}

export const Router = ({ children }) => (
  <BrowserRouter>
    {children || null}
    <Routes>
      <Route path="/" element={<Home pageIndex={pageIndex} />} />
      {pageIndex.map(({ meta, init }) => (
        <Route
          path={meta.slug}
          element={
            <Suspense fallback={<span>Loading</span>}>
              <Header key="header" />
              <Example init={init} />
              {/* <PageContent /> */}
            </Suspense>
          }
          key={meta.slug}
        />
      ))}
    </Routes>
  </BrowserRouter>
)

Router.propTypes = {
  children: propTypes.object,
}
