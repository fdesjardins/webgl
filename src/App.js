import { css } from '@emotion/css'

import { Router } from './Router'
import { Header } from './components/header/Header'

const style = css`
  font-family: 'Open Sans', sans-serif;
  background-color: var(--main-bg-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--font-color);
  min-height: var(--header-height);

  a {
    color: var(--font-color);
    text-decoration: none;
    transition: color 0.25s;
    &:hover {
      color: var(--font-color-light);
    }
  }

  #container {
    min-height: calc(100vh - var(--header-height));
    width: var(--main-content-max-width);
    padding: 20px;
    canvas {
      width: 100%;
    }
  }
`

export const App = () => (
  <div className={style}>
    <Router>
      <Header key="header" />
    </Router>
  </div>
)
