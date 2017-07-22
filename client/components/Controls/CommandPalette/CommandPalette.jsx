import Inferno from 'inferno'
import Mousetrap from 'mousetrap'
import utils, { sq } from '-/utils'

import './CommandPalette.scss'

const commands = [
  {
    name: 'home',
    text: 'Navigate home',
    keywords: [ 'h', 'home' ],
    action: router => router.push('/')
  },
  {
    name: 'basics1',
    text: 'Navigate to /basics/01',
    keywords: [ 'b1' ],
    action: router => router.push('/basics/01')
  }
]

const getCmd = () => document.querySelector('.command-palette')

const execute = router => {
  const cmd = getCmd().querySelector('.command-palette-search-results .selected').id
  commands.map(c => {
    if (c.name === cmd) {
      c.action(router)
      return hidePalette()
    }
  })
}

const handleCmdInput = (setQuery, selectNext, selectPrevious, execute) => e => {
  // console.log(e.key)
  if (e.key === 'Escape') {
    return hidePalette()
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    return selectPrevious()
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    return selectNext()
  }
  if (e.key === 'Backspace') {
    return setQuery()
  }
  if (e.key === 'Enter') {
    return execute()
  }
  const cmd = getCmd()
  const query = cmd.querySelector('input').value

  setQuery(query)
}

const hidePalette = () => {
  Mousetrap.unbind('esc')
  const cmd = getCmd()
  cmd.querySelector('input').value = ''
  cmd.classList.add('hidden')
  return false
}

const togglePalette = e => {
  Mousetrap.bind('esc', hidePalette)
  const cmd = getCmd()
  cmd.classList.toggle('hidden')
  cmd.querySelector('input').focus()
  return false
}

const CommandPaletteSearchResults = ({ results, selectedIndex }) => {
  if (results && results.length > 0) {
    const resultsLis = results.map((r, i) => {
      const className = i === selectedIndex ? 'selected' : ''
      return (
        <li class={ className } id={ r.name }>{ r.text }</li>
      )
    })
    return (
      <ul class='command-palette-search-results'>{ resultsLis }</ul>
    )
  }
  return (
    <span>No matches found</span>
  )
}

const CommandPaletteControls = ({ query, setQuery, selectedIndex, setIndex, router }) => {
  Mousetrap.bind('ctrl+shift+p', togglePalette)
  let results = findCommands(query)
  const selectNext = () => { setIndex(Math.min(results.length - 1, selectedIndex + 1)) }
  const selectPrevious = () => { setIndex(Math.max(0, selectedIndex - 1)) }

  const setQueryAndIndex = query => {
    setIndex(0)
    setQuery(query)
  }
  const executeAndSetIndex = () => {
    setIndex(0)
    setQuery('')
    execute(router)
  }

  return (
    <div class='command-palette-controls'>
      <input type='text' placeholder='' onKeyDown={ handleCmdInput(setQueryAndIndex, selectNext, selectPrevious, executeAndSetIndex) }/>
      <CommandPaletteSearchResults results={ results } selectedIndex={ selectedIndex }/>
    </div>
  )
}

const findCommands = query => commands.filter(c => {
  return (new RegExp(query, 'g')).test(c.name)
})

const CommandPalette = ({ children }, { store, router }) => {
  const queryCursor = store.select(sq('app.query'))
  const selectedIndex = store.select(sq('app.querySelectedIndex'))
  return (
    <div class='command-palette hidden'>
      <CommandPaletteControls
        query={ queryCursor.get() }
        setQuery={ query => queryCursor.set(query) }
        selectedIndex={ selectedIndex.get() }
        setIndex={ index => selectedIndex.set(index) }
        router={ router }
        onComponentShouldUpdate={ utils.shouldUpdate }
      />
    </div>
  )
}

export default CommandPalette
