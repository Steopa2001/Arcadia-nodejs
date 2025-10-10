// mail.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: Number(process.env.BREVO_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});
async function sendOrderEmails({ id, name, surname, email, total }) {
  const cliente = {
    from: process.env.MAIL_FROM,
    to: email,
    subject: `Conferma ordine #${id}`,
    html: `<p>Ciao <b>${name}</b>, ordine <b>#${id}</b> ricevuto. Totale: <b>€${total}</b>.</p>`,
  };

  const venditore = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO_SELLER,
    subject: `Nuovo ordine #${id}`,
    text: `Ordine da ${name} ${surname}. Totale: €${total}.`,
  };

  await transporter.sendMail(cliente);
  await transporter.sendMail(venditore);
  console.log("Email inviate tramite Brevo.");
}

module.exports = { sendOrderEmails };
