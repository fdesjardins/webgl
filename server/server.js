const path = require('path')
const express = require('express')
const compression = require('compression')
const cors = require('cors')

const port = process.env.PORT || 9000

const app = express()
app.use(compression())
app.use(express.static(path.join(__dirname, '../dist')))
app.use('/lib', express.static(path.join(__dirname, '../lib')))

app.use(cors())
app.all('*', cors())

app.all('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))

app.listen(port, () => console.log(`Listening on port ${port}`))
