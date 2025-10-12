const connection = require("../data/db");

// // ----------------------- PRODUCTS INDEX ----------------------------------------
// const indexProducts = (req, res) => {
//   const sql = "SELECT * FROM products";

//   connection.query(sql, (err, result) => {
//     if (err)
//       return res
//         .status(500)
//         .json("Errore nella esecuzione della query: " + err);

//     res.send(result);
//   });
// };

// ----------------------- PRODUCTS INDEX (ricerca, ordinamento, filtro per slug) -----------------------
const indexProducts = (req, res) => {
  const searchTerm = req.query.q ? req.query.q.toLowerCase() : "";
  const slug = req.query.slug; // lo slug della categoria (es. giochi-da-tavolo)

  let sortField = "name";
  let sortOrder = "ASC";
  if (req.query.sort === "price") sortField = "price";
  if (req.query.order === "desc") sortOrder = "DESC";

  // query base
  let sql = "SELECT p.* FROM products p";
  let values = [];

  // se c’è slug, join con categories
  if (slug) {
    sql += " JOIN categories c ON p.category_id = c.id WHERE c.slug = ?";
    values.push(slug);
  } else {
    sql += " WHERE 1=1"; // trucco per concatenare filtri
  }

  // se c’è ricerca
  if (searchTerm) {
    sql += " AND LOWER(p.name) LIKE ?";
    values.push(`%${searchTerm}%`);
  }

  // ordinamento
  sql += " ORDER BY p." + sortField + " " + sortOrder;

  // eseguo query
  connection.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Errore query: " + err });
    }
    res.json(result);
  });
};

// ----------------------- PRODUCTS BY CATEGORY ----------------------------------------
const indexProductsByCategory = (req, res) => {
  const { id } = req.params; // id della categoria
  const sql = "SELECT * FROM products WHERE category_id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Errore query: " + err });

    res.json(result); // array di prodotti
  });
};

// ----------------------- PRODUCT BY SLUG ----------------------------------------
const showProductBySlug = (req, res) => {
  const { slug } = req.params;
  const sql = "SELECT * FROM products WHERE slug = ?";

  connection.query(sql, [slug], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Errore nella query: " + err });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Prodotto non trovato" });
    }

    res.json(result[0]);
  });
};

// ----------------------- PRODUCT BY ID ----------------------------------------
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

// ----------------------- CREATE PRODUCT ----------------------------------------
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

// ----------------------- UPDATE PRODUCT (FULL) ----------------------------------------
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
    !name ||
    !slug ||
    !price ||
    !description ||
    discount === undefined ||
    !player_number ||
    !complexity ||
    !language ||
    !duration ||
    !recommended_age ||
    !genre ||
    image === undefined ||
    !category_id
  ) {
    return res.status(400).json({
      error: "Tutti i campi sono obbligatori",
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
    id,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: "Errore UPDATE: " + err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Prodotto non trovato" });
    }

    res.json({ message: "Prodotto aggiornato con successo" });
  });
};

// ----------------------- MODIFY PRODUCT (PARTIAL) ----------------------------------------
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

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Prodotto non trovato" });
    }

    res.json({ message: "Prodotto modificato con successo" });
  });
};

// ----------------------- DELETE PRODUCT ----------------------------------------
const deleteProduct = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM products WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Errore DELETE: " + err });
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

// ----------------------- CART (mocked in memory) ----------------------------------------
let cart = [];

// ----------------------- INDEX CART ----------------------------------------
const indexCart = (req, res) => {
  res.json(cart);
};

// ----------------------- ADD PRODUCT TO CART ----------------------------------------
const addToCart = (req, res) => {
  const product = req.body;

  if (!product.id) {
    return res.status(400).json({ error: "Serve un id prodotto" });
  }

  // Se il prodotto è già nel carrello, aumenta la quantità
  const existing = cart.find((p) => p.id == product.id);
  if (existing) {
    if (existing.quantity + product.quantity <= 10) {
      existing.quantity = (existing.quantity || 1) + product.quantity;
    }
    else {
      return res.status(400).json({ error: "Quantità massima (10) raggiunta per questo prodotto" });
    }
  }
  else {
    product.quantity = product.quantity || 1;
    cart.push(product);
  }

  res.status(201).json({ message: "Prodotto aggiunto al carrello", cart });
};

// ----------------------- UPDATE QUANTITY IN CART (PATCH) ----------------------------------------
const updateCartQuantity = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const product = cart.find((p) => p.id == id);

  if (!product) {
    return res.status(404).json({ error: "Prodotto non trovato nel carrello" });
  }

  product.quantity = quantity;

  res.json({
    message: `Quantità aggiornata per il prodotto ${id}`,
    cart,
  });
};

// ----------------------- DELETE PRODUCT FROM CART ----------------------------------------
const removeFromCart = (req, res) => {
  const { id } = req.params;
  cart = cart.filter((product) => product.id != id);
  res.json({ message: `Prodotto ${id} rimosso dal carrello`, cart });
};

// ----------------------- WISHLIST (mocked in memory) ----------------------------------------
let wishlist = [];

// ----------------------- INDEX WISHLIST ----------------------------------------
const indexWishlist = (req, res) => {
  res.json(wishlist);
};

// ----------------------- ADD PRODUCT TO WISHLIST ----------------------------------------
const addToWishlist = (req, res) => {
  const product = req.body;

  if (!product.id) {
    return res.status(400).json({ error: "Serve un id prodotto" });
  }

  // Evita duplicati
  const existing = wishlist.find((p) => p.id == product.id);
  if (existing) {
    return res.status(409).json({ message: "Prodotto già nella wishlist" });
  }

  wishlist.push(product);
  res
    .status(201)
    .json({ message: "Prodotto aggiunto alla wishlist", wishlist });
};

// ----------------------- DELETE PRODUCT FROM WISHLIST ----------------------------------------
const removeFromWishlist = (req, res) => {
  const { id } = req.params;
  wishlist = wishlist.filter((product) => product.id != id);
  res.json({ message: `Prodotto ${id} rimosso dalla wishlist`, wishlist });
};

// ----------------------- EXPORT ----------------------------------------
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
  removeFromCart,
  updateCartQuantity,
  indexWishlist,
  addToWishlist,
  removeFromWishlist,
};
