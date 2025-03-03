/* 
================ SERVICIO DE ENVÍO DE CORREOS =================

📌 **¿Qué hace?**
   - Carga y procesa plantillas de correo usando Handlebars.
   - Adjunta el logo de la empresa por defecto en todos los correos.
   - Permite agregar archivos adjuntos adicionales.
   - Envía correos electrónicos utilizando Nodemailer.

📚 **Métodos disponibles**:
   - `loadTemplate(templateName, variables)`: Carga y compila una plantilla HTML con Handlebars.
   - `sendEmail(to, subject, templateName, variables, attachments)`: Envía un correo con la plantilla especificada.

*/

// -----------📦 IMPORTACIONES-----------
const fs = require("fs"); // Módulo para manejo de archivos
const path = require("path"); // Módulo para manejo de rutas
const handlebars = require("handlebars"); // Motor de plantillas para correos
const transporter = require("../../nodemailer"); // Configuración de transporte de correo

/**
 * 📌 Carga y compila una plantilla de correo usando Handlebars.
 * ✅ Reemplaza variables dinámicas dentro de la plantilla.
 * @param {string} templateName - Nombre del archivo de la plantilla (sin extensión).
 * @param {Object} variables - Datos a insertar en la plantilla.
 * @returns {string} - HTML procesado con los valores insertados.
 */
const loadTemplate = (templateName, variables) => {
    const filePath = path.join(__dirname, `../Emails/${templateName}.html`);
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    return template(variables);
};

/**
 * 📌 Envía un correo electrónico con una plantilla específica.
 * ✅ Adjunta automáticamente el logo en todos los correos.
 * ✅ Permite adjuntar archivos adicionales.
 * @param {string} to - Dirección de correo del destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} templateName - Nombre de la plantilla de correo.
 * @param {Object} variables - Datos para insertar en la plantilla.
 * @param {Array<string>} [attachments=[]] - Rutas de archivos adicionales para adjuntar.
 * @returns {Promise<void>} - Promesa que indica el éxito o fallo del envío.
 */
const sendEmail = async (to, subject, templateName, variables, attachments = []) => {
    const html = loadTemplate(templateName, variables);

    // Agregar el logo predeterminado como imagen embebida en el correo
    const defaultAttachments = [
        {
            filename: "logo_color.jpg",
            path: path.join(__dirname, "../../img/logo_color.jpg"), // Ruta del logo
            cid: "logoDB" // CID para referenciar en el HTML
        }
    ];

    // Fusionar archivos adjuntos adicionales con los predeterminados
    const allAttachments = [
        ...defaultAttachments,
        ...attachments.map(filePath => ({
            filename: path.basename(filePath),
            path: filePath
        }))
    ];

    // Configurar opciones de correo
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        attachments: allAttachments
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('mail enviado')
    } catch (error) {
        console.error("❌ Error al enviar el correo electrónico:", error);
        throw new Error("No se pudo enviar el correo electrónico");
    }
};

module.exports = { sendEmail };
