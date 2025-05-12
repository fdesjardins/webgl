import { css } from '@emotion/css'
import { Link } from 'react-router-dom'

const style = css`
  width: 100%;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  z-index: 999;
  position: absolute;
  top: 0;
  left: 0;
`

export function Header() {
  return (
    <header className={style}>
      <Link to="/">Home</Link>
    </header>
  )
}
