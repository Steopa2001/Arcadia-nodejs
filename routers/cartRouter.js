const express = require("express");

const router = express.Router();

const arcadiaController = require("../controllers/arcadiaController");

router.get("/", arcadiaController.indexCart);

router.post("/", arcadiaController.addToCart);

// aggiorna la quantità di un prodotto nel carrello
router.patch("/:id", arcadiaController.updateCartQuantity);

router.delete("/:id", arcadiaController.removeFromCart);

module.exports = router;
