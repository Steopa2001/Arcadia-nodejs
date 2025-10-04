const express = require('express')

const router = express.Router()

const arcadiaController = require('../controllers/arcadiaController')

router.get('/', arcadiaController.indexProducts)

module.exports = router