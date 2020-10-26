import React from 'react'
import About from 'flat-color-icons/svg/about.svg'

const defaultStyle = {
  width: '1.2em',
  height: '1.2em',
  lineHeight: '1.2em',
  display: 'inline-block',
}

const defaultImgStyle = {
  width: '100%',
  height: '100%',
}

const decodeSrc = (name) =>
  ({
    about: About,
  }[name] || '')

const Icon = ({ name, className = '' }) => {
  return (
    <span className={'icon ' + className} style={defaultStyle}>
      <img src={decodeSrc(name)} style={defaultImgStyle} />
    </span>
  )
}

export default Icon
