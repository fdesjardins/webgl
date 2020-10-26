import React from 'react'

const Stats = ({ getPosition, getRotation }) => {
  const [pos, setPos] = React.useState({})
  const [rot, setRot] = React.useState({ x: 0, y: 0, z: 0 })

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPos(getPosition())
      setRot(getRotation())
    }, 100)
    return () => clearTimeout(timer)
  })

  const [x, y, z] = [
    parseFloat(pos.x).toFixed(4),
    parseFloat(pos.y).toFixed(4),
    parseFloat(pos.z).toFixed(4),
  ]
  const [rx, ry, rz] = [
    parseFloat(rot.x).toFixed(4),
    parseFloat(rot.y).toFixed(4),
    parseFloat(rot.z).toFixed(4),
  ]

  return (
    <span
      style={{
        position: 'absolute',
        color: 'black',
        padding: '5px',
        left: '65px',
        top: '35px',
      }}
    >
      <b>Position:</b> ({x}, {y}, {z})
      <br />
      <b>Rotation:</b> ({rx}, {ry}, {rz})
    </span>
  )
}

export default Stats
