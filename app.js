const express = require("express");
const cors = require("cors");
// aggiunta per Nodemailer
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const productsRouter = require("./routers/productsRouter");
const categoriesRouter = require("./routers/categoriesRouter");
const cartRouter = require("./routers/cartRouter");
const wishlistRouter = require("./routers/wishlistRouter");
const ordersRouter = require("./routers/ordersRouter");

app.use(cors({ origin: process.env.FE_APP }));

const errorsHandler = require("./middlewares/ErrorsHandler");
const notFound = require("./middlewares/NotFound");

app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Rotta base");
});

// rotte principali
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/cart", cartRouter);
app.use("/wishlist", wishlistRouter);
app.use("/orders", ordersRouter);

// middleware di errore
app.use(errorsHandler);
app.use(notFound);

app.listen(port, () => {
  console.log(`Server in ascolto alla porta ${port}`);
});
