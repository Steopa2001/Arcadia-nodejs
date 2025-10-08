const connection = require("../data/db");

// store

const storeOrders = (req, res) => {
  // recupero dati della form
  const { name, surname, email, address, cap, city, province, phone, total } =
    req.body;
  if (!name || !surname || !email || !address || !cap || !city || !province) {
    return res.status(400).json({ error: "Campi obbligatori mancanti" });
  }
  // query di inserimento
  const sql =
    "INSERT INTO orders (name, surname, email, address, cap, city, province, phone, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  connection.query(
    sql,
    [name, surname, email, address, cap, city, province, phone, total],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Errore INSERT:" + err });
      res.status(201).json({
        id: result.insertId,
        name,
        surname,
        email,
        address,
        cap,
        city,
        province,
        phone,
        total
      });
    }
  );
};

module.exports = { storeOrders };
