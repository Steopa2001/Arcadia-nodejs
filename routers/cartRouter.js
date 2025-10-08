const express = require('express')

const router = express.Router()

const arcadiaController = require('../controllers/arcadiaController')

router.get('/', arcadiaController.indexCart)

router.post('/', arcadiaController.addToCart)

router.delete('/:id', arcadiaController.removeFromCart)

module.exports = router