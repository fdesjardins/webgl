const fs = require('fs')
const path = require('path')
const express = require('express')
const compression = require('compression')
const cors = require('cors')
const browserSync = require('browser-sync')

module.exports = async (config) => {
  const app = express()
  app.use(compression())
  app.use('/dist', express.static(path.join(__dirname, '../dist')))

  app.use(cors())
  app.all('*', cors())

  const layout = (await fs.readFileSync(path.join(__dirname, 'layout.html'))).toString()
  app.get('*', (req, res, next) => {
    res.send(layout)
  })

  const server = app.listen(1137)
  console.log('listening on 1137...')

  const bs = browserSync.create()
  bs.init({
    proxy: 'localhost:1137',
    reloadDelay: 100
  })
  bs.watch(path.join(__dirname, '../dist/**/*.js')).on('change', bs.reload)
  bs.watch(path.join(__dirname, '../dist/**/*.css')).on('change', bs.reload)

  return { app, server }
}

if (!module.parent) {
  module.exports({})
}
