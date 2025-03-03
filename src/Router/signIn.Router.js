/* 
================ RUTAS DE REGISTRO (Sign-In) =================

📌 **USO**:
   - Maneja el registro de nuevos usuarios en el sistema.
   - Solo permite el registro de usuarios no autenticados.

📚 **RUTAS DISPONIBLES**:
   - `GET /signin/info` → Obtener información pública sobre el registro.
   - `POST /signin` → Registrar un nuevo usuario.

*/

// -----------📦 IMPORTACIONES-----------
const express = require('express');
const signInRouter = express.Router();
const signInController = require('../Controllers/signIn.Controller');

// -----------📦 IMPORTACION DE MIDDLEWARES-----------
const validate = require('../Middlewares/validateUser.middleware')

/**
 * @swagger
 * /signin:
 *   post:
 *     summary: Registra un nuevo usuario
 *     security: []
 *     tags: [SignIn]
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
 *               first_name:
 *                 type: string
 *                 example: 'Juan'
 *               last_name:
 *                 type: string
 *                 example: 'Pérez'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en el registro
 */
signInRouter.post('/', validate.validateUserCreation, signInController.registerUser);

module.exports = signInRouter ;