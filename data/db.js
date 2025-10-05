const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.log('Errore nella connessione al database: ' + err)
  }
  else {
    console.log('Connessione al database effettuata')
  }
})

module.exports = connection;