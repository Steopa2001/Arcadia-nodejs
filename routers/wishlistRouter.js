const express = require("express");
const router = express.Router();
const arcadiaController = require("../controllers/arcadiaController");

// Rotte wishlist
router.get("/", arcadiaController.indexWishlist);
router.post("/", arcadiaController.addToWishlist);
router.delete("/:id", arcadiaController.removeFromWishlist);

module.exports = router;
