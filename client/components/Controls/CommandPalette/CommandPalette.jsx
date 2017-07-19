import Inferno from 'inferno'
import Mousetrap from 'mousetrap'
// import commander from 'commander'

import './CommandPalette.scss'

const commands = [
  {
    name: 'home',
    keywords: [ 'h', 'home' ],
    action: router => router.push('/')
  }
]

const getCmd = () => document.querySelector('.command-palette')

const execute = router => {
  const cmd = getCmd()

  if (cmd.value) {
    // const argv = yargs.parse(cmd.value)
    // console.log(argv)
  }

  commands.map(c => {
    if (c.name === cmd.value || c.keywords.find(kw => kw === cmd.value)) {
      c.action(router)
      return hidePalette()
    }
  })
}

const handleCmdInput = router => e => {
  if (e.key === 'Escape') {
    return hidePalette()
  }
  if (e.key === 'Enter') {
    return execute(router)
  }
  return false
}

const hidePalette = () => {
  const cmd = getCmd()
  cmd.value = ''
  cmd.classList.add('hidden')
  return false
}

const togglePalette = e => {
  const cmd = getCmd()
  cmd.classList.toggle('hidden')
  cmd.focus()
  return false
}

const CommandPalette = ({ children }, { store, router }) => {
  Mousetrap.bind('ctrl+shift+p', togglePalette)
  return (
    <input type='text' class='command-palette hidden' onKeyUp={ handleCmdInput(router) }/>
  )
}

export default CommandPalette
