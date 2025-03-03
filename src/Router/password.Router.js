/* 
================ RUTAS DE RESTABLECIMIENTO DE CONTRASEÑA =================

📌 **USO**:
   - Maneja el restablecimiento de contraseña de los usuarios.
   - Permite solicitar un token de restablecimiento por correo.
   - Permite actualizar la contraseña con un token válido.

📚 **RUTAS DISPONIBLES**:
   - `POST /password/reset` → Solicitar un token de restablecimiento.
   - `POST /password/update` → Restablecer la contraseña con un token válido.
*/

// -----------📦 IMPORTACIONES-----------
const express = require("express");
const passwordController = require("../Controllers/password.Controller");
const passwordRouter = express.Router();

// -----------📦 IMPORTACION DE MIDDLEWARES-----------
const { authenticateResetToken, authenticateToken } = require("../Middlewares/auth.middleware");
const validate = require('../Middlewares/validateUser.middleware')

/**
 * @swagger
 * /password/reset:
 *   post:
 *     summary: Solicita un token para restablecer la contraseña Este enpoint envía correos reales 📧.
 *     tags: [Password]
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
 *     responses:
 *       200:
 *         description: Correo de restablecimiento enviado exitosamente.
 *       404:
 *         description: El correo no existe.
 */
passwordRouter.post("/reset", validate.validateSendPasswordResetEmail, passwordController.sendResetPasswordEmail);

/**
 * @swagger
 * /password/update:
 *   post:
 *     summary: Restablece la contraseña utilizando un token válido.
 *     tags: [Password]
 *     security:
 *       - ResetToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_password:
 *                 type: string
 *                 example: "NuevaContraseña123"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente.
 *       400:
 *         description: Token inválido o ya utilizado.
 */
passwordRouter.post("/update", authenticateResetToken, validate.validateResetPassword, passwordController.resetPassword);

/**
 * @swagger
 * /password/change:
 *   post:
 *     summary: Cambia la contraseña de un usuario autenticado.
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_password:
 *                 type: string
 *                 example: "MiContraseñaActual123"
 *               new_password:
 *                 type: string
 *                 example: "MiNuevaContraseña123"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente.
 *       400:
 *         description: La contraseña actual es incorrecta.
 *       401:
 *         description: Usuario no autenticado.
 */
passwordRouter.post("/change", authenticateToken(3), validate.validateChangePassword, passwordController.changePassword);

module.exports = passwordRouter;