const connection = require("../data/db");
const { sendOrderEmails } = require("../email");

// funzione per salvare un ordine e i suoi prodotti
const storeOrders = (req, res) => {
  const {
    name, surname, email, address, cap, city, province, phone,
    total: rawTotal, items = [], payment_method
  } = req.body;

  // controlli veloci
  if (!name || !surname || !email || !address || !cap || !city || !province) {
    return res.status(400).json({ error: "Campi obbligatori mancanti" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Il carrello è vuoto" });
  }

  // normalizza il totale ("33,91" -> 33.91)
  const total = Number(String(rawTotal).replace(",", ".")) || 0;

  // query ordine
  const sqlOrder = `
    INSERT INTO orders (name, surname, email, address, cap, city, province, phone, total, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sqlOrder,
    [name, surname, email, address, cap, city, province, phone, total, payment_method || null],
    (err, result) => {
      if (err) {
        console.error("Errore INSERT orders:", err);
        return res.status(500).json({ error: "Errore durante la creazione dell'ordine" });
      }

      const orderId = result.insertId;

      // query item
      const sqlItem = `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, product_name)
        VALUES (?, ?, ?, ?, ?)
      `;

      let inserted = 0;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];

        // accetta sia it.price che it.unit_price; se mancano, usa 0
        const unitPrice =
          Number(it.unit_price ?? it.price ?? 0);

        const values = [
          orderId,
          it.id,
          Number(it.qty || 1),
          unitPrice,
          it.name || null,
        ];

        connection.query(sqlItem, values, (err2) => {
          if (err2) console.error("Errore INSERT order_items:", err2);

          inserted++;

          // quando abbiamo finito TUTTI gli items…
          if (inserted === items.length) {
            //  rispondi SUBITO al client: niente attese per le e-mail
            res.status(201).json({
              id: orderId,
              total,
              items: items.length,
              message: "Ordine creato",
            });

            // invia e-mail in background (non blocca la response)
            queueMicrotask(async () => {
              try {
                await sendOrderEmails({ id: orderId, name, surname, email, total });
              } catch (mailErr) {
                console.error("Errore invio email:", mailErr);
              }
            });
          }
        });
      }
    }
  );
};

module.exports = { storeOrders };
