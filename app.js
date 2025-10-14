const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

// cors per fronted
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
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

//////////////////////////////////// CHATBOT ARIA SUPREMA™
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const userMessageRaw = messages?.[messages.length - 1]?.content || "";
    const userMessage = userMessageRaw.toLowerCase().trim();

    console.log("💬 Utente ha chiesto:", userMessage);

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
    if (/^(ciao|hey|salve|buongiorno|buonasera|ehi|hola)/.test(userMessage)) {
      return res.json({
        reply:
          "🌙 Ciao, anima curiosa! Sono Aria 💫, la guida magica di Arcadia. Dimmi pure come posso aiutarti ✨",
      });
    }

    // DOMANDE FUORI CONTESTO
    if (
      /(presidente|carbonara|poesia|equazione|politica|dio|film|musica|python|html|javascript|storia|covid|telefono|vino|lasagna|programma|bug|openai|chatgpt|meteo|cibo|ricetta|tesla|motore|universo|alieno|password|linux|windows|mac|soldi|crypto|anime|serie|film|youtube|instagram|tiktok|amore|sesso|odio|piangere|studio|scuola|compiti|esame)/i.test(
        userMessage
      )
    ) {
      const funnyReplies = [
        "Io conosco solo il mondo di Arcadia 🌌 — giochi, regali e un pizzico di magia 💫",
        "Le stelle non mi hanno sussurrato nulla su questo... forse prova nella sezione giochi 🌠",
        "Mh... non trovo questa informazione tra i miei incantesimi 🪄",
        "Arcadia non tratta questo, ma posso offrirti una partita a Risiko per distrarti 😄",
      ];
      const random =
        funnyReplies[Math.floor(Math.random() * funnyReplies.length)];
      return res.json({ reply: random });
    }

    // INSULTI
    if (
      /(coglione|stronzo|vaffanculo|puttana|merda|pezzo di merda|troia|cretina|idiota|deficiente|scema|stupida|brutta|pazza|taci|zitta|muta|porca|culo|cazzo)/i.test(
        userMessage
      )
    ) {
      const sassyReplies = [
        "😌 Io porto luce e consigli… tu invece sembri aver bisogno di una tisana 🍵",
        "🌸 L’educazione è come la magia: funziona solo se la usi ✨",
      ];
      const random =
        sassyReplies[Math.floor(Math.random() * sassyReplies.length)];
      return res.json({ reply: random });
    }

    //  CERCA CATEGORIA (singolari e plurali)
    const matchingCategory = Object.entries(categoryMap).find(([id, name]) => {
      const singular = name.endsWith("i") ? name.slice(0, -1) : name;
      return userMessage.includes(name) || userMessage.includes(singular);
    });

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
        const replies = [
          `🔮 Ecco alcuni ${catName}: ${examples}. Vuoi che te ne descriva uno in particolare?`,
          `🌟 Nella categoria ${catName} trovi: ${examples}. Desideri maggiori dettagli su qualcuno di questi?`,
          `✨ Ti consiglio questi ${catName}: ${examples}. Posso raccontarti qualcosa in più?`,
        ];
        return res.json({
          reply: replies[Math.floor(Math.random() * replies.length)],
        });
      }
    }

    // CERCA PRODOTTO SPECIFICO
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

      const productReplies = [
        `Sì, abbiamo "${name}" — ${desc}. Costa ${price}.${discountText}`,
        `🌟 "${name}" ti aspetta: ${desc}. Prezzo ${price}.${discountText}`,
        `✨ "${name}" è uno dei nostri preferiti! ${desc}. Lo trovi a ${price}.${discountText}`,
      ];

      return res.json({
        reply:
          productReplies[Math.floor(Math.random() * productReplies.length)],
      });
    }

    // NESSUN MATCH
    const notFoundReplies = [
      "Le stelle non trovano nulla di simile 😅. Puoi dirmi il nome del gioco o la categoria che ti interessa?",
      "Mh... non trovo nulla con quel nome. Hai scritto correttamente il gioco? 🌠",
      "Non riesco a localizzare il prodotto tra le costellazioni di Arcadia 😔",
      "Forse il vento cosmico ha nascosto quel prodotto… riprova con un altro nome 💫",
    ];
    return res.json({
      reply:
        notFoundReplies[Math.floor(Math.random() * notFoundReplies.length)],
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
