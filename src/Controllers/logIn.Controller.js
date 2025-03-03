/* 
================ CONTROLADOR DE LOGIN =================

📌 **Descripción**
   - Gestiona el inicio de sesión de los usuarios en el sistema.
   - Verifica las credenciales y genera un token JWT para la autenticación.
   - Se comunica con el servicio de usuarios para manejar la lógica de negocio.

📚 **Métodos disponibles**:
   - `loginUser(req, res, next)`: Autentica un usuario y devuelve un token de acceso.
*/

// -----------📦 IMPORTACIONES-----------
const { authenticateUser, logoutUser } = require('../Services/authServices'); // Importa el servicio de autenticación
const { serverResponse, formatError } = require('../Utils/responseUtils'); // Funciones de estandarización de respuestas
const { GENERAL } = require('../Utils/messages'); // Importa los mensajes preestablecidos

/**
 * Objeto que representa el controlador de Login
 */
const loginController = {
    /**
     * Controlador para autenticar un usuario
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Función para manejar errores
     */
    loginUser: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            // Capturar IP y Dispositivo
            const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const device_info = req.headers['user-agent'];

            const response = await authenticateUser({ email, password, ip_address, device_info });       
            return serverResponse(res, response);
        } catch (error) {
            next(formatError(error, 'loginUser-loginController', 401, GENERAL.UNAUTHORIZED));
        }
    },

    /**
     * Controlador para hacer logout
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Función para manejar errores
     */
    logoutUser: async (req, res, next) => {
        try {
            // Extraer token de los headers
            const token = req.header('Authorization')?.replace('Bearer ', '');

            const response = await logoutUser(token);            
            return serverResponse(res, response);
        } catch (error) {
            next(formatError(error, 'loginUser-loginController', 401, GENERAL.UNAUTHORIZED));
        }
    },
};

module.exports = loginController;