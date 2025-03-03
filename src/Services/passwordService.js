/* 
================ SERVICIO DE GESTIÓN DE CONTRASEÑAS =================

📌 **¿Qué hace?**
   - Permite a los usuarios cambiar su contraseña de manera segura.
   - Verifica la contraseña actual antes de permitir el cambio.
   - Aplica hash a la nueva contraseña antes de almacenarla.

📚 **Métodos disponibles**:
   - `changePassword(userId, data)`: Cambia la contraseña de un usuario autenticado.
*/

// -----------📦 IMPORTACIONES-----------
const bcrypt = require("bcrypt");
const { User } = require("../../Db/db.config"); // Modelo de usuario
const { AUTH, GENERAL, USER } = require("../Utils/messages"); // Mensajes preestablecidos
const { formatError } = require("../Utils/responseUtils"); // Función de manejo de errores
const { sendEmail } = require("../Helpers/emailHelper"); // Servicio de correo
const { generateResetToken } = require("../Helpers/jwtHelper"); // Generador de tokens de restablecimiento
require("dotenv").config(); // Carga variables de entorno

// -----------CONFIGURACIÓN DE SALT-----------
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

/**
 * 📌 Permite a un usuario cambiar su contraseña.
 * ✅ Verifica la contraseña actual antes de permitir el cambio.
 * ✅ Aplica hash a la nueva contraseña antes de guardarla.
 * @param {number} userId - ID del usuario autenticado.
 * @param {Object} data - Contiene `currentPassword` y `newPassword`.
 * @returns {Object} - Resultado del cambio de contraseña.
 */
const changePassword = async (userId, data) => {
    try {
        const { currentPassword, newPassword } = data;

        // Buscar el usuario por ID
        const user = await User.findByPk(userId);

        if (!user) {
            return { status: 404, success: false, message: USER.NOT_FOUND };
        }

        // Comparar la contraseña actual con la almacenada
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return { status: 401, success: false, message: AUTH.INVALID_CREDENTIALS };
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Actualizar la contraseña en la base de datos
        await user.update({ password: hashedPassword, updated_by: user.id });

        return { status: 200, success: true, message: USER.PASSWORD_CHANGED_SUCCES };
    } catch (error) {
        throw formatError(error, "changePassword-passwordService", 500, GENERAL.FAILURE);
    }
};

/**
 * 📌 Envía un correo con un token para restablecer la contraseña.
 * ✅ Genera un token de restablecimiento válido.
 * ✅ Guarda el token en la base de datos.
 * @param {string} email - Correo del usuario que solicita el restablecimiento.
 * @returns {Object} - Resultado del envío del correo.
 */
const sendPasswordResetEmail = async (email) => {
    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return { status: 404, success: false, message: AUTH.INVALID_EMAIL };
        }       

        // Generar token de restablecimiento
        const token = generateResetToken(user);

        // Guardar el token en la base de datos
        await user.update({
            reset_password_token: token,
            reset_password_token_used: false
        });

        // Variables para la plantilla de correo
        const variables = {
            HeadTitle: "Restablecimiento de Contraseña",
            NombreCompleto: user.first_name || "Usuari@",
            year: new Date().getFullYear(),
            Content: `
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p> </p>
                <p>Para continuar, utiliza el siguiente token:</p>
                <p><strong>${token}</strong></p>
                <p> </p>
                <p>Este token es válido por 24 horas. Si no lo usas en ese tiempo, tendrás que solicitar un nuevo token.</p>
                <p> </p>
                <p>Si no solicitaste un restablecimiento de contraseña, ignora este correo.</p>
                <p> </p>
                <p>Gracias,</p>
            `
        };

        // Enviar el correo
        await sendEmail(email, "Restablecimiento de contraseña", "customTemplate", variables);

        return { status: 200, success: true, message: USER.RESET_EMAIL_SENT, body:{ resetToken: token } };
    } catch (error) {
        throw formatError(error, "sendPasswordResetEmail-passwordService", 500, GENERAL.FAILURE);
    }
};

/**
 * 📌 Restablece la contraseña de un usuario.
 * ✅ Aplica un nuevo hash a la contraseña.
 * ✅ Marca el token de restablecimiento como usado.
 * @param {Object} user - Instancia del usuario en la base de datos.
 * @param {string} new_password - Nueva contraseña a establecer.
 * @param {string} current_password - Nueva contraseña a establecer.
 * @returns {Object} - Resultado del restablecimiento de contraseña.
 */
const resetPassword = async (user, new_password) => {
    try {
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);

        // Actualizar la contraseña y marcar el token como usado
        await user.update({
            password: hashedPassword,
            reset_password_token_used: true,
            updated_by: user.id
        });

        return { status: 200, success: true, message: USER.PASSWORD_RESET_SUCCESS };
    } catch (error) {
        throw formatError(error, "resetPassword-passwordService", 500, GENERAL.FAILURE);
    }
};



module.exports = { changePassword, resetPassword, sendPasswordResetEmail };