const express = require('express')

const router = express.Router()

const arcadiaController = require('../controllers/arcadiaController')

// Tutti i prodotti
router.get('/', arcadiaController.indexProducts);

// Prodotto singolo per slug (prima dello ID)
router.get('/slug/:slug', arcadiaController.showProductBySlug);

// Prodotto singolo per ID
router.get('/:id', arcadiaController.showProducts);

// Prodotti per categoria
router.get('/category/:id', arcadiaController.indexProductsByCategory);

// Creazione prodotto
router.post('/', arcadiaController.createProduct);

// Modifica totale del prodotto
router.put('/:id', arcadiaController.updateProduct);

// Modifica parziale del prodotto
router.patch('/:id', arcadiaController.modifyProduct);

// Delete prodotto
router.delete('/:id', arcadiaController.deleteProduct);


module.exports = router;