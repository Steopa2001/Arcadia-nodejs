const connection = require("../data/db");

const indexProducts = (req, res) => {
  const sql = "SELECT * FROM products";

  connection.query(sql, (err, result) => {
    if (err)
      return res
        .status(500)
        .json("Errore nella esecuzione della query: " + err);

    res.send(result);
  });
};

// -------------- PRODUCTS CATEGORIES -----------------
const indexProductsByCategory = (req, res) => {
  const { id } = req.params; // id della categoria
  const sql = "SELECT * FROM products WHERE category_id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Errore query: " + err });

    res.json(result); // array di prodotti
  });
};

// -------------- PRODUCTS BY SLUG --------------
const showProductBySlug = (req, res) => {
  const { slug } = req.params;
  const sql = "SELECT * FROM products WHERE slug = ?";

  connection.query(sql, [slug], (err, result) => {
    if (err) return res.status(500).json({ error: "Errore nella query: " + err });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Prodotto non trovato" });
    }

    res.json(result[0]);
  });
};


// ............... PRODUCTS SHOW......................
const showProducts = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM products WHERE id = ?";

  connection.query(sql, [id], (err, resultProduct) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "errore nell'esecuzione della query: " + err });
    }

    if (!resultProduct || resultProduct.length === 0) {
      return res.status(404).json({ error: "Product not Found" });
    }

    return res.json(resultProduct[0]);
  });
};

//  ----------------------PRODUCTS POST-------------------------------------

// POST /products
const createProduct = (req, res) => {
  const {
    name,
    slug,
    price,
    description,
    discount,
    player_number,
    complexity,
    language,
    duration,
    recommended_age,
    genre,
    image,
    category_id,
  } = req.body;

  if (!name) return res.status(400).json({ message: "il nome è obbligatorio" });

  const sql = `
    INSERT INTO products
      (name, slug, price, description, discount, player_number, complexity, language, duration, recommended_age, genre, image, category_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  connection.query(
    sql,
    [
      name,
      slug,
      price,
      description,
      discount,
      player_number,
      complexity,
      language,
      duration,
      recommended_age,
      genre,
      image,
      category_id,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Errore INSERT: " + err });
      res.status(201).json({
        id: result.insertId,
        name,
        slug,
        price,
        description,
        discount,
        player_number,
        complexity,
        language,
        duration,
        recommended_age,
        genre,
        image,
        category_id,
      });
    }
  );
};

// ----------------------- UPDATE PRODUCT----------------------------------------

const updateProduct = (req, res) => {
  const { id } = req.params;
  const {
    name,
    slug,
    price,
    description,
    discount,
    player_number,
    complexity,
    language,
    duration,
    recommended_age,
    genre,
    image,
    category_id,
  } = req.body;

  if (
    !name || !slug || !price || !description || discount === undefined ||
    !player_number || !complexity || !language || !duration ||
    !recommended_age || !genre || image === undefined || !category_id
  ) {
    return res.status(400).json({
      error: "Tutti i campi sono obbligatori"
    });
  }

  const sql = `
    UPDATE products
    SET name = ?, slug = ?, price = ?, description = ?, discount = ?, 
        player_number = ?, complexity = ?, language = ?, duration = ?, 
        recommended_age = ?, genre = ?, image = ?, category_id = ?
    WHERE id = ?
  `;

  const values = [
    name, slug, price, description, discount, player_number, complexity,
    language, duration, recommended_age, genre, image, category_id, id
  ];

  connection.query(sql, values, (err, result) => {
    if (err)
      return res.status(500).json({ error: "Errore UPDATE: " + err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Prodotto non trovato" });
    }

    res.json({ message: "Prodotto aggiornato con successo" });
  });
};

// ----------------------- MODIFY PRODUCT----------------------------------------

const modifyProduct = (req, res) => {
  const { id } = req.params;
  const productData = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID mancante" });
  }

  if (!productData) {
    return res.status(400).json({ error: "Nessun dato da aggiornare" });
  }

  const sql = "UPDATE products SET ? WHERE id = ?";

  connection.query(sql, [productData, id], (err, result) => {
    if (err) {
      console.error("Errore nella query PATCH:", err);
      return res.status(500).json({ error: "Errore UPDATE parziale: " + err });
    }

    // per capire quante righe sono state toccate dalla query
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Prodotto non trovato" });
    }

    res.json({ message: "Prodotto modificato con successo" });
  });
};


// ----------------------- DELETE PRODUCT----------------------------------------

const deleteProduct = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM products WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Errore DELETE: " + err });
    }


    res.json({ message: `Product ${id} eliminato con successo` });
  });
};

// ----------------------- CATEGORIES INDEX ----------------------------------------
const indexCategories = (req, res) => {
  const sql = "SELECT * FROM categories";
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Errore query: " + err });
    res.json(result);
  });
};

// ----------------------- CART ----------------------------------------
let cart = [];

// ----------------------- INDEX CART ----------------------------------------
const indexCart = (req, res) => {
  res.json(cart);
};

// ----------------------- ADD PRODUCT CART ----------------------------------------
const addToCart = (req, res) => {
  const product = req.body;

  if (!product.id) {
    return res.status(400).json({ error: "Serve un id prodotto" });
  }

  cart.push(product);
  res.status(201).json({ message: "Prodotto aggiunto al carrello", cart });
};

// ----------------------- DELETE PRODUCT CART ----------------------------------------
const removeFromCart = (req, res) => {
  const { id } = req.params;
  cart = cart.filter(product => product.id != id);
  res.json({ message: `Prodotto ${id} rimosso dal carrello`, cart });
};

module.exports = {
  indexProducts,
  showProducts,
  createProduct,
  updateProduct,
  modifyProduct,
  deleteProduct,
  indexCategories,
  indexProductsByCategory,
  showProductBySlug,
  indexCart,
  addToCart,
  removeFromCart
};
