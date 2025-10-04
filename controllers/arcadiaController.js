const connection = require('../data/db')

const index = (req, res) => {
  const sql = 'SELECT * FROM products'

  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json('Errore nella esecuzione della query: ' + err)

    res.send(result);
  })
}

module.exports = {
  index
}