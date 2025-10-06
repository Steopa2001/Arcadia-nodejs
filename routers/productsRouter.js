const express = require('express')

const router = express.Router()

const arcadiaController = require('../controllers/arcadiaController')

router.get('/', arcadiaController.indexProducts)
router.get('/:id', arcadiaController.showProducts);
// Rotta per filtrare per categoria
router.get('/category/:id', arcadiaController.indexProductsByCategory);
router.post("/", arcadiaController.createProduct);
router.delete("/:id", arcadiaController.deleteProduct);


module.exports = router;