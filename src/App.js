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
    // height: calc(100vh - var(--header-height));
    height: 100vh !important;
    width: 100%;
    overflow: hidden;
    position: absolute;

    canvas.example {
      width: 100% !important;
      // height: calc(100vh - var(--header-height)) !important;
      height: 100% !important;
    }

    .stats {
      // top: var(--header-height) !important;
      // top: auto !important;
      // bottom: 0 !important;
      right: 0 !important;
      left: auto !important;
      width: 100px;
      height: 70px;
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
    }
  }
`

export const App = () => (
  <div className={style}>
    <Router />
  </div>
)
