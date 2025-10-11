const connection = require("../data/db");
const { sendOrderEmails } = require("../email")
// funzione per salvare un ordine e i suoi prodotti
const storeOrders = (req, res) => {
  // recupero dati della form
  const {
    name,
    surname,
    email,
    address,
    cap,
    city,
    province,
    phone,
    total,
    items,
  } = req.body;

  // controlli
  if (!name || !surname || !email || !address || !cap || !city || !province) {
    return res.status(400).json({ error: "Campi obbligatori mancanti" });
  }

  if (items.length === 0) {
    return res.status(400).json({ error: "Il carrello è vuoto" });
  }

  // query per inserire l'ordine principale
  const sqlOrder = `
    INSERT INTO orders (name, surname, email, address, cap, city, province, phone, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sqlOrder,
    [name, surname, email, address, cap, city, province, phone, total],
    (err, result) => {
      if (err) {
        console.error("Errore INSERT orders:", err);
        return res
          .status(500)
          .json({ error: "Errore durante la creazione dell'ordine" });
      }

      //  salvo in orderId, l'id assegnato al nuovo ordine
      const orderId = result.insertId;

      // query per inserire i singoli prodotti
      const sqlItem = `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, product_name)
        VALUES (?, ?, ?, ?, ?)
      `;

      // contatore per sapere quando tutte le query hanno finito
      let inserted = 0;

      // ciclo su ogni prodotto
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const values = [
          orderId,
          item.id,
          parseInt(item.qty),
          parseFloat(item.price),
          item.name,
        ];

        connection.query(sqlItem, values, (err) => {
          if (err) console.error("Errore INSERT order_items:", err);

          inserted++;

          // quando  le insert sono completate, invio risposta
          if (inserted === items.length) {
            sendOrderEmails({ id: orderId, name, surname, email, total })
              .catch((err) => console.error("Errore invio email:", err))
              .finally(() => {
                res.status(201).json({
                  id: orderId,
                  total,
                  items: items.length,
                  message:
                    "Ordine e dettagli inseriti correttamente (email inviate)",
                });
              });
          }
        });
      }
    }
  );
};

module.exports = { storeOrders };
