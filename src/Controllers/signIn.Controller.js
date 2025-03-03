/* 
================ CONTROLADOR DE SIGN-IN =================

📌 **Descripción**
   - Gestiona la administración de usuarios por parte del SuperAdmin.
   - Proporciona funciones para registrar nuevos usuarios en el sistema.
   - Se comunica con el servicio de usuarios para manejar la lógica de negocio.

📚 **Métodos disponibles**:
   - `registerUser(req, res, next)`: Registra un nuevo usuario y devuelve la respuesta.
*/

// -----------📦 IMPORTACIONES-----------
const { createUser } = require('../Services/userService'); // Improta el servicio
const { serverResponse, formatError } = require('../Utils/responseUtils'); // Funciones de estandarización
const { GENERAL } = require('../Utils/messages') // Importa los mensajes preestablecidos

/**
 * objeto ue representa al controllador del SignIn
 */
const signInController = {
    /**
     * Controlador para registrar un usuario
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Función para manejar errores
     */
    registerUser: async (req, res, next) => {
        try {
            const response = await createUser(req.body);
            return serverResponse(res, response);
        } catch (error) {
            console.log(error);
            
            next(formatError(error, 'registerUser-signInController', 500, GENERAL.FAILURE))
        }
    },
}


module.exports = signInController;