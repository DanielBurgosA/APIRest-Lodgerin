/* 
================ RUTAS DE AUTENTICACIÓN (Login) =================

📌 **USO**:
   - Maneja el inicio de sesión de los usuarios en el sistema.
   - Solo permite la autenticación de usuarios registrados.

📚 **RUTAS DISPONIBLES**:
   - `POST /login` → Iniciar sesión con credenciales válidas.

*/

// -----------📦 IMPORTACIONES-----------
const express = require('express');
const loginRouter = express.Router();
const loginController = require('../Controllers/logIn.Controller');

// -----------📦 IMPORTACION DE MIDDLEWARES-----------
const validate = require('../Middlewares/validateUser.middleware')
const { authenticateToken } = require('../Middlewares/auth.middleware');

/**
 * @swagger
 * /session/login:
 *   post:
 *     summary: Inicia sesión con credenciales válidas
 *     tags: [LogIn]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 example: 'Sa345678'
 *     responses:
 *       200:
 *         description: Usuario autenticado exitosamente
 *       401:
 *         description: Credenciales inválidas
 */
loginRouter.post('/login', validate.validateLoginRequest, loginController.loginUser);

/**
 * @swagger
 * /session/logout:
 *   post:
 *     summary: Cierra sesión eliminando la sesión activa
 *     tags: [LogIn]
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         description: No autorizado, sesión no encontrada o token inválido
 */
loginRouter.post('/logout', authenticateToken(3), loginController.logoutUser);


module.exports = loginRouter;