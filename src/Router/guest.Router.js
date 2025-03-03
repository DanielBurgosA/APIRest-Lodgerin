/* 
================ RUTAS DE INVITADOS (Guest) =================

📌 **USO**:
   - Permite a usuarios no autenticados gestionar su cuenta.
   - Los invitados solo pueden ver y modificar su propio perfil.

📚 **RUTAS DISPONIBLES**:
   - `GET /guest/:id` → Ver su propio perfil.
   - `PATCH /guest/:id` → Modificar su propio perfil.
*/

// -----------📦 IMPORTACIONES-----------
const express = require("express");
const guestRouter = express.Router();
const userController = require("../Controllers/user.Controller");

// -----------📦 IMPORTACION DE MIDDLEWARES-----------
const { authenticateToken } = require("../Middlewares/auth.middleware");
const validate = require("../Middlewares/validateUser.middleware");

/**
 * @swagger
 * /guest:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado (Guest).
 *     tags: [Guest]
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente.
 *       403:
 *         description: No autorizado.
 *       404:
 *         description: Usuario no encontrado.
 */
guestRouter.get("/", userController.getSelf);

/**
 * @swagger
 * /guest:
 *   patch:
 *     summary: Permite a un Guest modificar su propio perfil.
 *     tags: [Guest]
 *     security:
 *     requestBody:
 *       required: false  # ❌ La solicitud puede enviarse sin datos
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevoemail@example.com"
 *               first_name:
 *                 type: string
 *                 example: "NuevoNombre"
 *               last_name:
 *                 type: string
 *                 example: "NuevoApellido"
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito.
 *       400:
 *         description: Datos inválidos en la solicitud.
 *       403:
 *         description: No autorizado.
 *       404:
 *         description: Usuario no encontrado.
 */
guestRouter.patch("/", validate.validateUserUpdate, userController.updateSelf);

module.exports = guestRouter;