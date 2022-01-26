import { css } from '@emotion/css'
import { Link } from 'react-router-dom'

const style = css`
  width: 100%;
  height: var(--header-height);
  // background-color: var(--header-bg-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  z-index: 999;

  > button {
    // background: var(--font-color);
    background: none;
    border-radius: 5px;
    border: none;
    color: var(--font-color);
    transition: all 0.25s;
    &:hover {
      color: var(--font-color-light);
      cursor: pointer;
    }
  }
`

export function Header() {
  return (
    <header className={style}>
      <Link to="/">Home</Link>
      {/* <button>Stats</button> */}
    </header>
  )
}
