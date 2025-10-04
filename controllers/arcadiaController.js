const connection = require('../data/db')

const indexProducts = (req, res) => {
  const sql = 'SELECT * FROM products'

  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json('Errore nella esecuzione della query: ' + err)

    res.send(result);
  })
}

const indexCategories = (req, res) => {
  const sql = 'SELECT * FROM categories'

  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json('Errore nella esecuzione della query: ' + err)

    res.send(result);
  })
}

const indexGiochiTavolo = (req, res) => {
  const sql = 'SELECT * FROM products WHERE category_id = ?'

  connection.query(sql, [1], (err, result) => {
    if (err) return res.status(500).json('Errore nella esecuzione della query: ' + err)

    res.send(result);
  })
}

module.exports = {
  indexProducts,
  indexCategories
}