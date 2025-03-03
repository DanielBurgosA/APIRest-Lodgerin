/* 
================ SERVICIO DE USUARIOS =================

📌 **¿Qué hace?**
   - Se encarga de la lógica de negocio relacionada con los usuarios.
   - Hashea contraseñas antes de guardarlas en la base de datos.
   - Maneja la creación de nuevos usuarios.

📚 **Métodos disponibles**:
   - `createUser(data)`: Crea un usuario con datos validados.
*/

// -----------📦 IMPORTACIONES-----------
const bcrypt = require('bcrypt'); // Importa bcrypt para hasheo de claves
const { User, Role } = require('../../Db/db.config'); // Importa el modelo de usuario
const { USER, GENERAL, AUTH } = require('../Utils/messages') //Importa los mensajes preestablecidos
const { formatError } = require('../Utils/responseUtils'); //Funciones de estandarización
require('dotenv').config(); //Variables de entorno
const { Op } = require('sequelize'); // Op de sequelize

// -----------CONFIGURACIÓN SALT-----------
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
 
// -----------FUNCIONES-----------
 /**
 * Crea un nuevo usuario en la base de datos
 * @param {Object} data - Datos del usuario a registrar
 * @returns {Object} - Usuario creado
 */
const createUser = async (data, user=null) => {
      if (user?.role_id === 3) {
        return { status: 403, success: false, message: AUTH.UNAUTHORIZED };
    }
    
    try {
      const { email, password, first_name, last_name, role_id } = data;
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return { status:400, success:false, message: USER.EXISTED_ERROR }
      }
  
      // Hashear la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
      // Crear el usuario en la base de datos
      const newUser = await User.create({
        email,
        password: hashedPassword,
        first_name,
        last_name,
        role_id,
        created_by: user?.id || null
      });
  
      return { status:201, success:true, message: USER.CREATED, body:newUser };
    } catch (error) {
      throw formatError(error, 'createUser-userService', 500, GENERAL.FAILURE)
    }
  };

  /**
 * 📌 Obtiene todos los usuarios, respetando los roles:
 * 🔹 `1` → Puede ver a todos.
 * 🔹 `2` → Puede ver a los de nivel `2` y `3`.
 * 🔹 `3` → Solo puede verse a sí mismo.
 */
const getAllUsers = async (rol, query) => {
  try {
    if (rol == 3) {
        return { status: 403, success: false, message: AUTH.UNAUTHORIZED };
    }

    // Filtra usuarios dependiendo del nivel de roles
    let whereCondition = rol === 1 ? {} : { role_id: [2, 3] };

    const { page = 1, limit = 10, name, role_id, is_blocked } = query;

    if (role_id) {
      whereCondition.role_id = Array.isArray(role_id) ? role_id : [role_id];
    } if (is_blocked !== undefined) {
      whereCondition.is_blocked = is_blocked;
    } if (name) {
      whereCondition[Op.or] = [
        { first_name: { [Op.iLike]: `%${name}%` } },
        { last_name: { [Op.iLike]: `%${name}%` } }
      ];
    }

    const offset = (page - 1) * limit

    const { rows: users, count } = await User.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    return {
      status: 200,
      success: true,
      message: USER.FOUND,
      body: {
        users,
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count / limit),
      }
    };
  } catch (error) {
    console.log(error);
    
      throw formatError(error, 'getAllUsers-userService', 500, GENERAL.FAILURE);
  }
};

 /**
 * 📌 Obtiene un usuario por su ID, respetando roles:
 * 🔹 `1` → Puede ver a `2` y `3`.
 * 🔹 `2` → Puede ver a `3`.
 * 🔹 `3` → Solo puede verse a sí mismo.
 */
const getUserById = async (searchId, user) => {
  // Verificar si el usuario tiene permiso para ver al otro usuario
  if (user.role_id === 3 && user.id !== searchId) {
    return { status: 403, success: false, message: AUTH.UNAUTHORIZED };
  }

  try {
      let attributes = ['id','first_name', 'last_name', 'email'];
      if (user.role_id !== 3) {
        attributes.push('is_blocked', 'role_id', 'created_by', 'updated_by');
      }

      const userById = await User.findByPk(searchId, {
        attributes,
        include: user.role_id !== 3
            ? [
                {
                    model: Role,
                    as: 'role',
                    attributes: [['name', 'role_name']], 
                },
            ]
            : [],
        raw: true, 
        nest: true, 
      });

      if (!userById) {
          return { status: 404, success: false, message: USER.NOT_FOUND };
      }

      // Verificar si el usuario tiene permiso para ver al otro usuario      
      if (user.role_id === 2 && userById.role_id === 1) {
          return { status: 403, success: false, message: AUTH.UNAUTHORIZED };
      }

      delete userById.role_id
      if (user.role_id !== 1) delete userById.id;

      return { status: 200, success: true, message: USER.FOUND, body: userById };
  } catch (error) {
      throw formatError(error, 'getUserById-userService', 500, GENERAL.FAILURE);
  }
};

/**
 * 📌 Actualiza un usuario en la base de datos.
 * @param {number} updateId - ID del usuario a actualizar.
 * @param {Object} user - Usuario que esta usando al ruta.
 * @param {Object} data - Datos nuevos del usuario.
 * @returns {Object} - Resultado de la operación.
 */
const updateUser = async (updateId, user, data) => {
  // Verificar si el usuario tiene permiso para ver al otro usuario 
  if (user.role_id === 3 && user.id !== updateId) {
    return { status: 403, success: false, message: AUTH.UNAUTHORIZED };
  }
  
  try {
    const userToUpdate = await User.findByPk(updateId);

    if (!userToUpdate) {
      return { status: 404, success: false, message: USER.NOT_FOUND };
    }

    // Verificar si el usuario tiene permiso para modificar al otro usuario      
    if (user.role_id === 2 && (userToUpdate.role_id === 1 || (userToUpdate.role_id === 2 && user.id !== updateId))) {
      return { status: 403, success: false, message: AUTH.UNAUTHORIZED };
    }
    
    // Si se está intentando actualizar el email, verificar que no esté en uso
    if (data.email && data.email !== userToUpdate.email) {
      const existingUser = await User.findOne({ where: { email: data.email } });

      if (existingUser && existingUser.id !== updateId) {
        return { status: 409, success: false, message: USER.EMAIL_EXIST };
      }
    }

    // Actualizar usuario con los nuevos datos
    data.updated_by = user.id
    await userToUpdate.update(data);

    return { status: 200, success: true, message: USER.UPDATED, body: userToUpdate};
  } catch (error) {
    console.log(error);
    
    throw formatError(error, "updateUser-userService", 500, GENERAL.FAILURE);
  }
};

  
module.exports = { createUser, getAllUsers, getUserById, updateUser };