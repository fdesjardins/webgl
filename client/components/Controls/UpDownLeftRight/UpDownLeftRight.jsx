import Inferno from 'inferno'

const UpDownLeftRight = ({ onLeft, onRight, onUp, onDown }) => {
  return (
    <div class='controls'>
      <button class='left' onClick={ onLeft }>left</button>
      <button class='up' onClick={ onUp }>up</button>
      <button class='right' onClick={ onRight }>right</button>
      <button class='down' onClick={ onDown }>down</button>
    </div>
  )
}

export default UpDownLeftRight
