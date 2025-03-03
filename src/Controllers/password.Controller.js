/* 
================ CONTROLADOR DE RESTABLECIMIENTO DE CONTRASEÑA =================

📌 **Descripción**
   - Gestiona el flujo de restablecimiento de contraseña de los usuarios.
   - Envía un correo con un token para restablecer la contraseña.
   - Permite establecer una nueva contraseña con un token válido.

📚 **Métodos disponibles**:
   - `sendResetPasswordEmail(req, res, next)`: Envía un correo con un token de restablecimiento.
   - `resetPassword(req, res, next)`: Permite cambiar la contraseña usando un token válido.
*/

// -----------📦 IMPORTACIONES-----------
const { sendPasswordResetEmail, resetPassword } = require("../Services/passwordService");
const { authenticateUser } = require('../Services/authServices'); // Importa el servicio de autenticación
const { serverResponse, formatError } = require("../Utils/responseUtils"); // Funciones de estandarización
const { GENERAL, USER, AUTH } = require("../Utils/messages"); // Importa los mensajes preestablecidos
const bcrypt = require('bcrypt');

/**
 * 📌 Controlador de restablecimiento de contraseña
 */
const passwordController = {
    /**
     * 📌 Envía un correo con un token para restablecer la contraseña.
     * ✅ Verifica si el correo existe antes de generar el token.
     * @param {Object} req - Petición HTTP (Debe contener `email` en el body).
     * @param {Object} res - Respuesta HTTP.
     * @param {Function} next - Función para manejar errores.
     */
    sendResetPasswordEmail: async (req, res, next) => {
        try {
            const { email } = req.body;
            const response = await sendPasswordResetEmail(email);
            return serverResponse(res, response);
        } catch (error) {
            next(formatError(error, "sendResetPasswordEmail-passwordController", 500, GENERAL.FAILURE));
        }
    },

    /**
     * 📌 Restablece la contraseña con un token válido.
     * ✅ Verifica si el token es válido antes de actualizar la contraseña.
     * @param {Object} req - Petición HTTP (Debe contener `token` y `newPassword` en el body).
     * @param {Object} res - Respuesta HTTP.
     * @param {Function} next - Función para manejar errores.
     */
    resetPassword: async (req, res, next) => {
        try {
            const { new_password } = req.body;

            if (!req.user) {
                return serverResponse(res, { status: 400, success: false, message: USER.INVALID_RESET_TOKEN });
            }

            const response = await resetPassword(req.user, new_password);
            return serverResponse(res, response);
        } catch (error) {
            next(formatError(error, "resetPassword-passwordController", 500, GENERAL.FAILURE));
        }
    },

    /**
     * 📌 Cambia la contraseña con un token válido.
     * ✅ Verifica si el token es válido antes de actualizar la contraseña.
     * @param {Object} req - Petición HTTP (Debe contener `token` y `newPassword` en el body).
     * @param {Object} res - Respuesta HTTP.
     * @param {Function} next - Función para manejar errores.
     */
    changePassword: async (req, res, next) => {
        try {
            const { new_password, current_password } = req.body;
            
            if (!req.user) {
                return serverResponse(res, { status: 400, success: false, message: AUTH.INVALID_CREDENTIALS });
            }

            // Comparar la contraseña ingresada con la almacenada
            const isPasswordValid = await bcrypt.compare(current_password, req.user.password);    
            
            if (!isPasswordValid ) {
                return serverResponse(res, { status: 400, success: false, message: AUTH.INVALID_CREDENTIALS });
            }

            const response = await resetPassword(req.user, new_password);
            return serverResponse(res, response);
        } catch (error) {
            next(formatError(error, "changePassword-passwordController", 500, GENERAL.FAILURE));
        }
    },
};

module.exports = passwordController;