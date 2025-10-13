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
    html: `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color:#4B0082;">Grazie per il tuo ordine, ${name}!</h2>
    <p>Abbiamo ricevuto il tuo ordine n. <strong>${id}</strong>.</p>
    <p>Totale: <strong>€${total.toFixed(2)}</strong></p>

    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">

    <p style="font-size: 14px; color:#555;">
      Cordiali saluti,<br>
      <strong>Arcadia</strong><br>
      <a href="mailto:arcadiamagicgamess@gmail.com" style="color:#4B0082;">arcadiamagicgamess@gmail.com</a>
    </p>
  </div>
`,
  };

  const venditore = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO_SELLER,
    subject: `🛒 Nuovo ordine #${id} ricevuto`,
    html: `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color:#4B0082; margin-bottom: 10px;">Nuovo ordine ricevuto</h2>
    <p style="margin: 5px 0;">Numero ordine: <strong>#${id}</strong></p>
    <p style="margin: 5px 0;">Cliente: <strong>${name} ${surname}</strong></p>
    <p style="margin: 5px 0;">Email: <a href="mailto:${email}" style="color:#4B0082;">${email}</a></p>
    <p style="margin: 10px 0 20px 0;">Totale: <strong>€${total.toFixed(
      2
    )}</strong></p>

    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
  </div>
  `,
  };

  await transporter.sendMail(cliente);
  await transporter.sendMail(venditore);
  console.log("Email inviate.");
}

module.exports = { sendOrderEmails };
