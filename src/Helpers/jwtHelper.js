/* 
================ MANEJO DE TOKENS JWT ================

Este archivo contiene funciones para manejar la generación y verificación de tokens JWT para autenticación, refresco y restablecimiento de contraseña.

⚙️ **FUNCIONES**:
   - `generate`, `verify` → Métodos base para la generación y verificación de tokens.
   - `generateToken`, `verifyToken` → Tokens de autenticación.
   - `generateRefreshToken`, `verifyRefreshToken` → Tokens de refresco.
   - `generateResetToken`, `verifyResetToken` → Tokens de restablecimiento de contraseña.

🚀 **USO**:
   - Se utiliza para gestionar tokens de autenticación en la API.
   - Permite la verificación y regeneración de tokens JWT cuando expiran.
   - Maneja tokens de restablecimiento de contraseña de manera segura.
*/

// -----------📦 IMPORTACIONES-----------
const jwt = require('jsonwebtoken'); //Librería para crear y verificar JWT.
require('dotenv').config(); //Variables de entorno
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
const jwtResetSecret = process.env.JWT_RESET_PASSWORD_SECRET;

//-----------FUNCIONES INTERNAS-----------
 /**
 * Genera un token JWT con un payload basado en el usuario.
 * @param {Object} user - Objeto de usuario con datos esenciales.
 * @param {string} secretKey - Clave secreta para firmar el token.
 * @param {string} expiresIn - Tiempo de expiración del token (ejemplo: '1h').
 * @returns {string} Token JWT generado.
 */
const generate = (user, secretKey, expiresIn) => {
    const payload = { user: { id: user.id, username: user.first_name }};

    return jwt.sign(payload, secretKey, { expiresIn });
};

 /**
 * Verifica y decodifica un token JWT.
 * @param {string} token - Token JWT a verificar.
 * @param {string} secretKey - Clave secreta usada para la verificación.
 * @returns {Object} Datos del usuario si el token es válido.
 * @throws {Error} Si el token es inválido o ha expirado.
 */
const verify = (token, secretKey) => {
    const decoded = jwt.verify(token, secretKey);
    return decoded.user;
};

//-----------FUNCIONES A EXPORTAR-----------
 //Funciones de Token
const generateToken = (user) => {
    return generate(user, jwtSecret, '1h');
};

const verifyToken = (token, refreshToken) => {
    try {
        return { user: verify(token, jwtSecret), newToken: null, newRefreshToken: null };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            try {
                const user = verify(refreshToken, jwtRefreshSecret);
                return { user, newToken: generateToken(user), newRefreshToken: newRefreshToken = generateRefreshToken(user)};
            } catch (refreshError) {
                throw new Error('Invalid or expired token');
            }
        }
        
        throw new Error('Invalid or expired token');
    }
};

 //Funciones de RefreshToken
const generateRefreshToken = ( user ) => {
    return generate(user, jwtRefreshSecret, '2h');
};

const verifyRefreshToken = (token) => {
    try {
        return verify(token, jwtRefreshSecret);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

 //Funciones de resetToken
const generateResetToken = (user) => {
    return generate(user, jwtResetSecret, '1h');
};

const verifyResetToken = (token) => {
    try {
        return verify(token, jwtResetSecret);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = {
    generateToken,
    verifyToken,
    generateResetToken,
    verifyResetToken,
    generateRefreshToken,
    verifyRefreshToken,
};