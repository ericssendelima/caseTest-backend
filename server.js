import 'dotenv/config';
import express from "express";
import 'express-async-errors';
import cors from 'cors';

import { MailtrapClient } from "mailtrap";

const app = express();
app.use(express.json()); // Para processar JSON
app.use(express.urlencoded({ extended: true }));

const TOKEN = process.env.TOKEN_EMAIL;
const SENDER_EMAIL = process.env.SENDER_EMAIL_PRIVATE;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL_PRIVATE;
const client = new MailtrapClient({ token: TOKEN });

const sender = { name: "Mailtrap Test", email: SENDER_EMAIL };

app.get("/", (req, res) => {
  const { email, id, utm_source, utm_channel, utm_campaign, utm_medium, referring_site, created_at } =
    req.query; // Captura os parâmetros da URL

  if (!email || !id) {
    return res.status(400).json({ error: "Faltando parâmetros na requisição" });
  }
  const message = `
  ROTA ACIONADA POR REQUISIÇÃO GET
  Email que leu: ${email}
  id do post: ${id}
  source foi: ${utm_source}
  channel foi: ${utm_channel}
  medium foi: ${utm_medium}
  campaign foi: ${utm_campaign}
  site: ${referring_site}
  criado em: ${created_at}`;

  client
    .send({
      from: sender,
      to: [{ email: RECIPIENT_EMAIL }],
      subject: "Hello from Mailtrap!",
      text: message,
    })
    .then(console.log)
    .catch(console.error);

  console.log("📩 Webhook recebido:", {
    email,
    id,
    utm_campaign,
    utm_medium,
    utm_source,
    utm_channel,
    referring_site,
    created_at,
  });

  return res
    .status(200)
    .json({ message: "✅ Webhook recebido com sucesso!", email, id });
});


// Rota para testar se o servidor está rodando
app.get("/status", (req, res) => {
  res.send("🚀 Servidor Webhook está rodando!");
});

app.head("/testeHead", (req, res) => {
  console.log("🔄 Requisição HEAD recebida!");
  // Pode retornar um status 200 OK para confirmar que a requisição HEAD está funcionando
  res.status(200).json({"text": "🔄 Requisição HEAD recebida!"}).end(); // A resposta de HEAD normalmente não tem corpo
});

app.use((err, req, res, next) => {
  if (err instanceof Error) {
      //Se for uma instância do tipo error 
      return res.status(400).json({
          error: err.message
      })
  }
  return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
  })
})

// Inicia o servidor na porta correta do Glitch
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
