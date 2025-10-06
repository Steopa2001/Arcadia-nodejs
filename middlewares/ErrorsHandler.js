//creo la funzione che trova errori nel codice
const errorsHandler = (err, req, res, next) => {
  res.status(500).json({ error: err.message });
}

module.exports = errorsHandler;