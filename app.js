const express = require('express');

const cors = require('cors')

const app = express();

const port = process.env.PORT;

const productsRouter = require('./routers/productsRouter')

const categoriesRouter = require('./routers/categoriesRouter');

app.use(cors({ origin: process.env.FE_APP }))

const errorsHandler = require('./middlewares/ErrorsHandler');

const notFound = require('./middlewares/NotFound')

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Rotta base')
})

app.use(express.json())

app.use('/products', productsRouter)

app.use('/categories', categoriesRouter)

app.use(errorsHandler)

app.use(notFound)

app.listen(port, () => {
  console.log(`Server in ascolto alla porta ${port}`)
})