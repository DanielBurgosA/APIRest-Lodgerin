/* 
================ CONTROLADOR DE USUARIOS =================

📌 **USO**:
   - Maneja las acciones relacionadas con los usuarios, como creación, consulta y actualización.
   - Se comunica con `userService.js` para gestionar la lógica de negocio.

📚 **FUNCIONES DISPONIBLES**:
   - `registerUser(req, res, next)`: Crea un nuevo usuario.
   - `getAllUsers(req, res, next)`: Obtiene la lista de usuarios con restricciones por roles.
   - `getUserById(req, res, next)`: Obtiene un usuario por su ID con restricciones por roles.
   - `updateUser(req, res, next)`: Actualiza un usuario con restricciones por roles.
*/

// -----------📦 IMPORTACIONES-----------
const userService = require("../Services/userService");
const { serverResponse, formatError } = require("../Utils/responseUtils");

/**
 * 📌 Controlador de usuarios
 */
const userController = {
  /**
   * 📌 Registra un nuevo usuario.
   * ✅ Solo usuarios con permisos pueden registrar nuevos usuarios.
   */
  registerUser: async (req, res, next) => {
    try {
      const user = req.user; // Usuario autenticado
      const response = await userService.createUser(req.body, user);
      return res.status(response.status).json(response);
    } catch (error) {
      next(formatError(error, "registerUser-userController", 500));
    }
  },

  /**
   * 📌 Obtiene todos los usuarios con restricciones de roles.
   */
  getAllUsers: async (req, res, next) => {
    try {
      const user = req.user; // Usuario autenticado
      const query = req.body
      const response = await userService.getAllUsers(user.role_id, query);
      return res.status(response.status).json(response);
    } catch (error) {
      next(formatError(error, "getAllUsers-userController", 500));
    }
  },

  /**
   * 📌 Obtiene un usuario por ID con restricciones de roles.
   */
  getUserById: async (req, res, next) => {
    try {
      const user = req.user; // Usuario autenticado
      const searchId = req.params.id;
      const response = await userService.getUserById(searchId, user);
      return res.status(response.status).json(response);
    } catch (error) {
      next(formatError(error, "getUserById-userController", 500));
    }
  },

  /**
   * 📌 Obtiene un usuario por ID con restricciones de roles.
   */
  getSelf: async (req, res, next) => {
    try {
      const user = req.user; // Usuario autenticado
      const response = await userService.getUserById(user.id, user);
      return res.status(response.status).json(response);
    } catch (error) {
      next(formatError(error, "getUserById-userController", 500));
    }
  },

  /**
   * 📌 Actualiza un usuario con restricciones de roles.
   */
  updateUser: async (req, res, next) => {
    try {
      const user = req.user; // Usuario autenticado
      const updateId = req.params.id;
      const response = await userService.updateUser(updateId, user, req.body);
      return res.status(response.status).json(response);
    } catch (error) {
      next(formatError(error, "updateUser-userController", 500));
    }
  },

  /**
   * 📌 Actualiza un usuario con restricciones de roles.
   */
  updateSelf: async (req, res, next) => {
    try {
      const user = req.user; // Usuario autenticado
      const response = await userService.updateUser(user.id, user, req.body);
      return res.status(response.status).json(response);
    } catch (error) {
      next(formatError(error, "updateUser-userController", 500));
    }
  }
};

module.exports = userController;