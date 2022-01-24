import { css } from '@emotion/css'
import { Link } from 'react-router-dom'

const style = css`
  width: 100%;
  height: var(--header-height);
  background-color: var(--header-bg-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;

  > button {
    background: var(--font-color);
    border-radius: 5px;
    border: none;
  }
`

export function Header() {
  return (
    <header className={style}>
      <Link to="/">Home</Link>
      {/* <button>Settings</button> */}
    </header>
  )
}
