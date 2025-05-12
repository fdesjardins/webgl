import { css } from '@emotion/css'
import PropTypes from 'prop-types'

const errorFallbackStyle = css`
  min-height: 100vh;
  max-width: 100%;
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  h1 {
    color: var(--red);
  }
  pre {
    background-color: var(--main-bg-color-dark);
    padding: 1em;
    border: 1px solid var(--font-color-dark);
    border-radius: 3px;
    color: var(--red);
    margin-bottom: 20%;
    max-height: 50vh;
    overflow: auto;
    ::-webkit-scrollbar {
      width: 10px;
    }
    ::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      -webkit-border-radius: 10px;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: var(--red);
      border-radius: 3px;
    }
  }
`

export const ErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className={errorFallbackStyle} role="alert">
      <h1>{error.name}</h1>
      <br />
      <h2>{error.message}</h2>
      <br />
      <pre>{error.stack}</pre>
    </div>
  )
}

ErrorBoundaryFallback.propTypes = {
  error: PropTypes.object,
  resetErrorBoundary: PropTypes.func,
}
