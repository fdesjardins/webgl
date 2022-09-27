import propTypes from 'prop-types'
import { HashRouter, Routes, Route } from 'react-router-dom'

// eslint-disable-next-line import/no-unresolved
import * as pages from './pages/*/index.js'
import { Home } from './pages/home/Home'
import { Page } from './components/page/Page'

const pageIndex = Object.keys(pages)
  .map((key) => pages[key])
  .filter((x) => !!x.meta)
  .sort((a, b) => a.meta.title.localeCompare(b.meta.title))

export const Router = ({ children }) => (
  <HashRouter>
    {children || null}
    <Routes>
      <Route path="/" element={<Home pageIndex={pageIndex} />} />
      {pageIndex.map(({ meta, options, init }) => (
        <Route
          key={meta.slug}
          path={meta.slug}
          element={<Page meta={meta} options={options} init={init} />}
        />
      ))}
    </Routes>
  </HashRouter>
)

Router.propTypes = {
  children: propTypes.object,
}
