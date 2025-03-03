/* 
================ CONFIGURACIÓN DE TRANSPORTE DE CORREO =================

📌 **Descripción**
   - Configura el transporte de correo electrónico utilizando Nodemailer.
   - Permite el envío de correos mediante SMTP con autenticación.
   - Usa un pool de conexiones para optimizar el envío masivo.

📚 **Configuración**
   - `host`: Servidor SMTP de Gmail.
   - `port`: Puerto 465 (SSL/TLS seguro).
   - `auth`: Credenciales del remitente (`EMAIL_USER` y `EMAIL_PASS` desde `.env`).
   - `pool`: Habilitado para mejorar la eficiencia en envíos múltiples.

🚀 **Exporta**:
   - `transporter`: Objeto configurado para enviar correos.
*/

require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:"smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true, 
  maxConnections: 5, 
  maxMessages: 100,
});

module.exports = transporter;