/* 
================ SERVICIO DE AUTENTICACIÓN =================

📌 **¿Qué hace?**
   - Maneja la lógica de autenticación de usuarios.
   - Verifica credenciales y genera tokens de acceso y actualización.

📚 **Métodos disponibles**:
   - `authenticateUser(data)`: Verifica credenciales y devuelve tokens.
*/

// -----------📦 IMPORTACIONES-----------
const bcrypt = require('bcrypt');
const { User, Session } = require('../../Db/db.config'); // Modelo de usuario
const { AUTH, USER, GENERAL } = require('../Utils/messages'); // Mensajes preestablecidos
const { formatError } = require('../Utils/responseUtils'); // Función de manejo de errores
const { generateToken, generateRefreshToken } = require('../Helpers/jwtHelper');

/**
 * 📌 Autentica a un usuario verificando sus credenciales.
 * ✅ Si es válido, devuelve tokens de acceso y actualización.
 * @param {Object} data - Datos de autenticación (email y password).
 * @returns {Object} - Resultado de la autenticación con éxito o error.
 */
const authenticateUser = async (data) => {
    try {
        const { email, password, ip_address, device_info } = data;

        // Buscar el usuario en la base de datos por email
        const user = await User.findOne({ where: { email } });

        // Verificar si el usuario existe
        if (!user) {
            return { status: 401, success: false, message: AUTH.INVALID_CREDENTIALS };
        }

        // Comparar la contraseña ingresada con la almacenada
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return { status: 401, success: false, message: AUTH.INVALID_CREDENTIALS };
        }

        // Generar tokens
        // Generar tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Buscar todas las sesiones activas del usuario en el mismo dispositivo e IP
        const existingSessions = await Session.findAll({
            where: {
                user_id: user.id,
                ip_address: ip_address || 'Desconocido',
                device_info: device_info || 'Desconocido'
            }
        });

        // Si existen sesiones previas, eliminarlas
        if (existingSessions.length > 0) {
            await Session.destroy({
                where: {
                    user_id: user.id,
                    ip_address: ip_address || 'Desconocido',
                    device_info: device_info || 'Desconocido'
                }
            });
        }

        // Crear una nueva sesión con los nuevos tokens
        await Session.create({
            user_id: user.id,
            access_token: token,
            refresh_token: refreshToken,
            ip_address: ip_address || 'Desconocido',
            device_info: device_info || 'Desconocido',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return { 
            status: 200, 
            success: true, 
            message: USER.AUTH_SUCCESS, 
            body: { token, refreshToken } 
        };
    } catch (error) {
        throw formatError(error, 'authenticateUser-authService', 500, GENERAL.FAILURE);
    }
};

/**
 * 📌 Cierra sesión eliminando la sesión activa.
 * ✅ Elimina la sesión de la base de datos basada en el token de acceso.
 * @param {Object} data - Datos con el token de acceso.
 * @returns {Object} - Resultado del logout.
 */
const logoutUser = async ( token ) => {
    try {
        // Buscar la sesión en la base de datos
        const session = await Session.findOne({ where: { access_token: token } });

        if (!session) {
            return { status: 404, success: false, message: AUTH.SESSION_NOT_FOUND };
        }

        // Eliminar la sesión
        await session.destroy();

        return { status: 200, success: true, message: AUTH.LOGOUT_SUCCESS };
    } catch (error) {
        throw formatError(error, 'logoutUser-authService', 500, GENERAL.FAILURE);
    }
};

module.exports = { authenticateUser, logoutUser };