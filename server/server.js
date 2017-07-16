const fs = require('fs')
const path = require('path')
const express = require('express')
const livereload = require('livereload')
const compression = require('compression')
const cors = require('cors')

module.exports = async (config) => {
  const app = express()
  app.use(compression())
  app.use(express.static(path.join(__dirname, '../dist')))

  app.use(cors())
  app.all('*', cors())

  const layout = (await fs.readFileSync(path.join(__dirname, 'layout.html'))).toString()
  app.get('/', (req, res, next) => {
    res.send(layout)
  })

  const server = app.listen(1137)
  console.log('listening on 1137...')

  const livereloadServer = livereload.createServer({
    delay: 100
  })
  livereloadServer.watch(path.join(__dirname, '../dist'))

  return { app, server }
}

if (!module.parent) {
  module.exports({})
}
