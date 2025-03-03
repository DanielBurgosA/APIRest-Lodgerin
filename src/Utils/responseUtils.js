/* 
================ UTILIDADES DE RESPUESTA Y ERRORES ================

Este archivo contiene funciones utilitarias para manejar respuestas y errores 
de manera estandarizada en la API.

⚙️ **FUNCIONES**:
   - `serverResponse` → Formato estandar de las respuestas de la API
   - `formatError`, `errorHandler` → Manejo de Errores estandarizado

🚀 **USO**:
   - Se utiliza en controladores y middleware para asegurar respuestas 
     consistentes y un manejo centralizado de errores.
*/


/**
 * Genera una respuesta estándar para la API.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Object} options - Opciones de la respuesta.
 * @param {number} options.status - Código de estado HTTP.
 * @param {boolean} options.success - Indica si la operación fue exitosa.
 * @param {string} [options.message] - Mensaje descriptivo de la respuesta.
 * @param {Object} [options.body] - Datos opcionales de la respuesta.
 * @returns {Object} Respuesta formateada en JSON.
 */
const serverResponse = (res, { status, success, message, body }) => {
    const response = Object.assign(
        success !== undefined && { success },
        message !== undefined && { message },
        body !== undefined && { body }
    );

    return res.status(status).json(response)
};

/**
 * Formatea un error para asegurar un formato uniforme en la API.
 * @param {Error} error - Objeto de error.
 * @param {string} location - Ubicación donde ocurrió el error.
 * @param {number} [status=500] - Código de estado HTTP por defecto.
 * @param {string} [message='Error interno del servidor'] - Mensaje de error por defecto.
 * @returns {Error} Objeto de error formateado.
 */
const formatError = (error, location, status = 500, message = 'Error interno del servidor') => {
    if (!error.status) {
        error.status = status;
        error.message = message;
    }

    if (!error.consoled) {
        console.error(`❌ Error en ${location}: ${error}`);
        console.error(error.stack);
        error.consoled = true;
    }

    return error;
};

/**
 * Middleware global para manejar errores en la API.
 * Captura errores y los responde en un formato uniforme.
 * @param {Error} err - Objeto de error.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const errorHandler = (err, req, res, next) => {
    if (!err.consoled) {
        console.error(`❌ Error capturado en errorHandler: ${err.message}`);
        console.error(err.stack);
    }

    serverResponse(res, { 
        status: err.status || 500, 
        success: false, 
        message: err.message || 'Error interno del servidor'
    });
};

module.exports = { serverResponse, formatError, errorHandler };