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

// --------------------CATEGORIES INDEX------------------------------------------
const indexCategories = (req, res) => {
  const sql = "SELECT * FROM categories";
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Errore query: " + err });
    res.json(result);
  });
};

module.exports = {
  indexProducts,
  showProducts,
  createProduct, 
  deleteProduct,
  indexCategories,
  indexProductsByCategory
};
