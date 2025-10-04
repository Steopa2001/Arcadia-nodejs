const express = require('express');

const cors = require('cors')

const app = express();

const port = process.env.PORT;

const arcadiaRouter = require('./routers/arcadiaRouter')

app.use(cors({ origin: process.env.FE_APP }))

//import errorHandler

//import notFound

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Rotta base')
})

app.use(express.json())

app.use('/products', arcadiaRouter)

//use errorHandler

//use notFound

app.listen(port, () => {
  console.log(`Server in ascolto alla porta ${port}`)
})