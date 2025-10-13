const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

// cors per fronted
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.static("public"));
app.use(express.json());

// router principali
const productsRouter = require("./routers/productsRouter");
const categoriesRouter = require("./routers/categoriesRouter");
const cartRouter = require("./routers/cartRouter");
const wishlistRouter = require("./routers/wishlistRouter");
const ordersRouter = require("./routers/ordersRouter");

// middleware
const errorsHandler = require("./middlewares/ErrorsHandler");
const notFound = require("./middlewares/NotFound");

// aggiunte per Aria SUPREMA™
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const Fuse = require("fuse.js");

app.use(express.static("public"));
app.use(express.json());

// rotta base
app.get("/", (req, res) => {
  res.send("Rotta base");
});

// rotte principali
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/cart", cartRouter);
app.use("/wishlist", wishlistRouter);
app.use("/orders", ordersRouter);

//  CHATBOT ARIA SUPREMA™
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const userMessageRaw = messages?.[messages.length - 1]?.content || "";
    const userMessage = userMessageRaw.toLowerCase().trim();

    // Recupera prodotti e categorie dal backend stesso
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`http://localhost:${port}/products`),
      fetch(`http://localhost:${port}/categories`),
    ]);
    const products = await productsRes.json();
    const categories = await categoriesRes.json();

    // Crea mappa categorie
    const categoryMap = {};
    for (const c of categories) categoryMap[c.id] = c.name.toLowerCase();

    // Configura Fuse.js per ricerca intelligente
    const fuse = new Fuse(products, {
      keys: ["name", "description", "genre"],
      threshold: 0.3,
    });

    // RISPOSTE RAPIDE
    if (/ciao|hey|salve|buongiorno/.test(userMessage)) {
      return res.json({
        reply:
          "🌙 Ciao, sono Aria 💫. Posso aiutarti a trovare giochi, regali o gadget!",
      });
    }

    // Domande fuori contesto
    if (
      /(presidente|carbonara|poesia|equazione|politica|dio|film|musica|python|html|javascript|storia|covid|telefono|vino|lasagna|programma|bug|openai|chatgpt|meteo|cibo|ricetta)/i.test(
        userMessage
      )
    ) {
      return res.json({
        reply:
          "Io conosco solo il mondo di Arcadia 🌌 — giochi, regali e un pizzico di magia 💫",
      });
    }

    // Cerca categoria
    const matchingCategory = Object.entries(categoryMap).find(([id, name]) =>
      userMessage.includes(name)
    );
    if (matchingCategory) {
      const [catId, catName] = matchingCategory;
      const categoryProducts = products.filter(
        (p) => String(p.category_id) === String(catId)
      );
      if (categoryProducts.length > 0) {
        const examples = categoryProducts
          .slice(0, 3)
          .map((p) => p.name)
          .join(", ");
        return res.json({
          reply: `🔮 Ecco alcuni ${catName}: ${examples}. Vuoi che te ne descriva uno in particolare?`,
        });
      }
    }

    // Cerca prodotto specifico
    const results = fuse.search(userMessage);
    if (results.length > 0) {
      const best = results[0].item;
      const name = best.name || "Prodotto sconosciuto";
      const desc = best.description || "Nessuna descrizione disponibile";
      const price = best.price ? `${best.price}€` : "prezzo non disponibile";

      let discountText = "";
      if (best.discount && best.discount > 0)
        discountText = ` È in offerta al ${best.discount}%.`;
      else discountText = " Attualmente non è in sconto 💜.";

      return res.json({
        reply: `Sì, abbiamo "${name}" — ${desc}. Costa ${price}.${discountText}`,
      });
    }

    // Nessun match
    return res.json({
      reply:
        "Le stelle non trovano nulla di simile 😅. Puoi dirmi il nome del gioco o la categoria che ti interessa?",
    });
  } catch (err) {
    console.error("❌ Errore chatbot:", err);
    res.status(500).json({ error: "Errore nel chatbot" });
  }
});

// middleware di errore
app.use(errorsHandler);
app.use(notFound);

// avvio server
app.listen(port, () => {
  console.log(
    `🪄 Server in ascolto alla porta ${port} — Aria SUPREMA™ attiva ✨`
  );
});
