/* 
================ RUTAS DE ADMINISTRADOR =================

📌 **USO**:
   - Permite a un Administrador gestionar su cuenta y la de otros usuarios.
   - Los administradores pueden ver y modificar su propio perfil, así como gestionar otros usuarios.

📚 **RUTAS DISPONIBLES**:
   - `GET /admin` → Ver su propio perfil.
   - `GET /admin/users` → Ver todos los usuarios.
   - `GET /admin/users/{id}` → Ver un usuario específico.
   - `PATCH /admin` → Modificar su propio perfil.
   - `PATCH /admin/users/{id}` → Modificar otro usuario.
*/

// -----------📦 IMPORTACIONES-----------
const express = require("express");
const adminRouter = express.Router();
const userController = require("../Controllers/user.Controller");

// -----------📦 IMPORTACIÓN DE MIDDLEWARES-----------
const validate = require("../Middlewares/validateUser.middleware");

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Obtiene el perfil del Administrador autenticado. Necesita un JWT Token Logeado para funcionar
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Información del Administrador obtenida exitosamente.
 *       403:
 *         description: No autorizado.
 *       404:
 *         description: Usuario no encontrado.
 */
adminRouter.get("/", userController.getSelf);

/**
 * @swagger
 * /admin/search:
 *   post:
 *     summary: Obtiene la lista de todos los usuarios. Los Admin no pueden ver al usuario del SuperAdmin. Puede paginar y buscar filtrando. Necesita un JWT Token Logeado para funcionar
 *     tags: [Admin]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 example: 1
 *                 description: Número de página para la paginación.
 *               limit:
 *                 type: integer
 *                 example: 10
 *                 description: Número de usuarios por página (límite de resultados).
 *               name:
 *                 type: string
 *                 example: "Juan"
 *                 description: Filtra los usuarios por nombre (solo letras y espacios).
 *               role_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *                 description: Filtra los usuarios por rol (puede ser un array con varios valores).
 *               is_blocked:
 *                 type: boolean
 *                 example: false
 *                 description: Filtra los usuarios por estado de bloqueo (true o false).
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente.
 *       403:
 *         description: No autorizado.
 */
adminRouter.post("/search", validate.validateUserQuery, userController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Obtiene la información de un usuario específico por su ID. Los Admin no pueden ver al usuario del SuperAdmin. Necesita un JWT Token Logeado para funcionar
 *     tags: [Admin]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 123
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente.
 *       403:
 *         description: No autorizado.
 *       404:
 *         description: Usuario no encontrado.
 */
adminRouter.get("/users/:id", userController.getUserById);

/**
 * @swagger
 * /admin:
 *   patch:
 *     summary: Permite al Administrador modificar su propio perfil. Necesita un JWT Token Logeado para funcionar
 *     tags: [Admin]
 *     requestBody:
 *       required: false
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
 *         description: Perfil actualizado con éxito.
 *       400:
 *         description: Datos inválidos en la solicitud.
 *       403:
 *         description: No autorizado.
 *       404:
 *         description: Usuario no encontrado.
 */
adminRouter.patch("/", validate.validateUserUpdate, userController.updateSelf);

/**
 * @swagger
 * /admin/users/{id}:
 *   patch:
 *     summary: Permite a un Administrador o SuperAdmin modificar un usuario. Usuarios con rol Admin(2) pueden bloquear usuarios Guest. Solo el SuperAdmin(1) puede cambiar los role_id o bloquear Administrdores. Necesita un JWT Token Logeado para funcionar
 *     tags: [Admin]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 123
 *     requestBody:
 *       required: false
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
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NuevaContraseña123!"
 *               role_id:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 example: 2
 *                 description: |
 *                   - **1 → SuperAdmin** (Solo modificable por un SuperAdmin)
 *                   - **2 → Admin**
 *                   - **3 → Guest**
 *               is_blocked:
 *                 type: boolean
 *                 example: false
 *                 description: Indica si el usuario está bloqueado.
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
adminRouter.patch("/users/:id", validate.validateUserUpdate, userController.updateUser);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Permite a un Administrador o SuperAdmin crear un nuevo usuario. Necesita un JWT Token Logeado para funcionar
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *               - role_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevoemail@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NuevaContraseña123!"
 *               first_name:
 *                 type: string
 *                 example: "NuevoNombre"
 *               last_name:
 *                 type: string
 *                 example: "NuevoApellido"
 *               role_id:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 example: 2
 *                 description: |
 *                   - **1 → SuperAdmin** (Solo puede ser creado por otro SuperAdmin)
 *                   - **2 → Admin**
 *                   - **3 → Guest**
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 *       400:
 *         description: Datos inválidos en la solicitud.
 *       403:
 *         description: No autorizado.
 */
adminRouter.post("/users", validate.validateUserCreation, userController.registerUser);


module.exports = adminRouter;