import { css } from '@emotion/css'

import { Router } from './Router'

const style = css`
  font-family: 'Open Sans', sans-serif;
  background-color: var(--main-bg-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--font-color);
  min-height: var(--header-height);
  overflow: hidden;

  a {
    color: var(--font-color);
    text-decoration: none;
    transition: color 0.25s;
    &:hover {
      color: var(--font-color-light);
    }
  }
`

export const App = () => (
  <div className={style}>
    <Router />
  </div>
)
