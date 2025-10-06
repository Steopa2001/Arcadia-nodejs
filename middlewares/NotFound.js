//creo una funzione che controlli che esista la rotta dell'endpoint
const notFound = (req, res, next) => {
  res.status(404).json({ error: "Not Found", message: "Pagina non trovata" })
}

module.exports = notFound;