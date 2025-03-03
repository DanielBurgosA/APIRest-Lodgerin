/* 
================ MIDDLEWARE DE AUTENTICACIÓN ================

Este archivo contiene middlewares para validar tokens JWT de autenticación,
restablecimiento de contraseña y manejar el modo de mantenimiento.

⚙️ **FUNCIONES**:
   - `authenticateToken` → Valida el token JWT de autenticación y asigna rol.
   - `authenticateResetToken` → Valida el token de restablecimiento de contraseña.
   - `maintenanceMode` → Verifica si el sistema está en modo de mantenimiento.

🚀 **USO**:
   - `authenticateToken`: Protege rutas que requieren autenticación.
   - `authenticateResetToken`: Protege rutas de restablecimiento de contraseña.
   - `maintenanceMode`: Controla accesos durante el mantenimiento.
*/

// -----------📦 IMPORTACIONES----------
const { verifyToken, verifyResetToken } = require('../Helpers/jwtHelper'); // Utilidades para verificar tokens JWT
const { User, Session } = require('../../Db/db.config'); // Modelos de usuarios y roles.
const { serverResponse, formatError } = require('../Utils/responseUtils') // Funciones de respuesta y manejo de errores
const { AUTH, GENERAL } = require('../Utils/messages') // Mensajes de error y autenticación
require('dotenv').config(); //Variables de entorno

//-----------FUNCIONES JWT-----------
 /**
 * Middleware para autenticar tokens JWT en solicitudes protegidas.
 * 
 * - Extrae el token del encabezado `Authorization`.
 * - Verifica si el usuario existe y no está bloqueado.
 * - Asigna el usuario y los roles al `req`.
 * - Renueva el token si ha expirado.
 *
 * @param {Number} rol - Nivel de rol requerido para acceder a la ruta.
 * @returns {Function} Middleware de Express.
 */
const authenticateToken = (rol) => {
    return async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const refreshToken = req.headers['x-refresh-token'];
        const token = authHeader && authHeader.split(' ')[1];

        //validación si el sistema esta en mantenimiento
        if (process.env.MAINTENANCE_MODE === 'true') {
            res.header('x-maintenance-mode', 'true');
            return serverResponse(res, { status: 503, success: false, message: GENERAL.MAINTENANCE });
        }
        
        // Validación si hay token
        if (!token){
            return serverResponse(res, { status: 401, success: false, message: messages.AUTH.NO_TOKEN });
        }

        try {
            const { user, newToken, newRefreshToken } = verifyToken(token, refreshToken);            

            const userDb = await User.findOne({
                where: { id: user.id },
            });
            
            if (!userDb) {
                return serverResponse(res, { status: 401, success: false, message: AUTH.UNAUTHORIZED });
            } if (userDb.IsBlocked) {
                return serverResponse(res, { status: 401, success: false, message: AUTH.BLOCKED });
            }

            // Buscar la sesión activa del usuario
            const session = await Session.findOne({ where: { user_id: user.id, access_token: token } });

            if (!session) {
                return serverResponse(res, { status: 401, success: false, message: AUTH.SESSION_NOT_FOUND });
            }

            //Validación del nivel del rol
            const authorizedRole = parseInt(rol, 10);
            const dbUserRoleId = parseInt(userDb.role_id, 10);
            
            const rolePermissions = {
                1: [1,],   // Si el rol requerido es 1 (SuperAdmin), el rol del usuario debe ser solo 1
                2: [1, 2],  // Si el rol requerido es 2 (Admin), el rol del usuario debe ser 1 o 2
                3: [1, 2, 3],   // Si el rol requerido es 3 (Guest), el rol del usuario debe ser 1, 2 o 3
            };
            if (!rolePermissions[authorizedRole]?.includes(dbUserRoleId)) {
                return serverResponse(res, { status: 401, success: false, message: AUTH.UNAUTHORIZED });
            }

            //agregar el usuario y su rol al req
            req.user = userDb;
            req.rol = dbUserRoleId

            // Si hay nuevos tokens, enviarlos en los headers
            if (newToken) {
                await session.update({
                    access_token: newToken,
                    refresh_token: newRefreshToken
                });

                req.headers['authorization'] = `Bearer ${newToken}`;
                req.headers['x-refresh-token'] = newRefreshToken;

                res.setHeader('x-new-token', newToken);
                res.setHeader('x-new-refresh-token', newRefreshToken);
                res.setHeader('x-user-permissions', dbUserRoleId);
            }

            next();
        } catch (error) {
            if (error.message === 'Invalid or expired token') {
                return serverResponse(res, { status: 401, success: false, message: AUTH.INVALID_CREDENTIALS });
            } else {
                next(formatError(error, 'auth.middleware'));
            }
        }
    };
};

 /**
 * Middleware para autenticar tokens de restablecimiento de contraseña.
 * 
 * - Extrae el token del encabezado `Authorization`.
 * - Verifica su validez y asigna el usuario al `req.user`.
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para continuar con la ejecución.
 */
const authenticateResetToken = async (req, res, next) => {
    const token = req.headers['x-reset-token'];    

    if (!token) {
        return serverResponse(res, { status: 401, success: false, message: AUTH.NO_TOKEN });
    }

    try {
        const { id } = verifyResetToken(token);

        const userDb = await User.findOne({
            where: { id, reset_password_token: token, reset_password_token_used: false },
        });

        if (!userDb) {
            return serverResponse(res, { status: 401, success: false, message: AUTH.RESET_INVALID });
        }

        req.user = userDb;
        next();
    } catch (error) {
        if (error.message === 'Invalid or expired token') {
            return serverResponse(res, { status: 401, success: false, message: AUTH.RESET_INVALID });
        }
        next(formatError(error, 'auth.middleware'));
    }
};



module.exports = { authenticateToken, authenticateResetToken };