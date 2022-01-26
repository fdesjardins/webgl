import { css } from '@emotion/css'
import propTypes from 'prop-types'

import Menu from '../../components/menu/Menu'

const style = css`
  min-height: calc(100vh - var(--header-height));
  max-width: var(--main-content-max-width);
  width: 100%;
  padding: 50px;
`

export function Home({ pageIndex }) {
  return (
    <main className={style}>
      <Menu
        index={pageIndex.map(({ meta }) => ({
          slug: meta.slug,
          tags: meta.tags,
          title: meta.title,
        }))}
      />
    </main>
  )
}

Home.propTypes = {
  pageIndex: propTypes.arrayOf(propTypes.object),
}
