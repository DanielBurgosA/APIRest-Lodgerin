/* 
================ MIDDLEWARE DE VALIDACIÓN =================

📌 **¿Qué hace?**
   - Valida y estructura los datos del usuario antes de procesarlos en el backend.
   - Diferencia entre validación de **creación y modificación**.
   - Asigna roles automáticamente en el registro cuando es necesario.
   - **Elige el `schema` dinámicamente dependiendo del `role_id` en `req.body`**.

🚀 **USO**:
   - `validateUserCreation`: Valida y asigna roles al registrar un usuario.
   - `validateUserUpdate`: Valida modificaciones, permitiendo cambios de rol según roles.

⚠️ **Importante**:
   - `role_id` no debe ser enviado por el frontend en el registro de guest o primer usuario, **el backend lo asigna**.
   - En modificación, `role_id` solo puede cambiarse en esquemas específicos.
   - Todos los campos en modificación son **opcionales**, pero si se envían, **deben ser válidos**.

*/

// -----------📦 IMPORTACIONES-----------
const Joi = require('joi'); // Importación de Joi
const { User } = require('../../Db/db.config'); // Para contar usuarios en la BD
const { serverResponse, formatError } = require('../Utils/responseUtils'); // Funciones de estandarización
const { GENERAL } = require('../Utils/messages') // Importa los mensajes preestablecidos
const sanitizeHtml = require('sanitize-html'); // Import sanitieHTML


/**
 * 📌 Función para sanitizar entradas antes de validarlas.
 * 🔹 Protege contra XSS eliminando etiquetas peligrosas.
 * 🔹 `password` NO se modifica, ya que se encripta antes de guardarse.
 */
const sanitizeInput = (data) => {
    let sanitizedData = {};
    for (let key in data) {
        if (typeof data[key] === 'string') {
            if (key === 'password') {
                sanitizedData[key] = data[key].trim(); // 🔹 No se sanitiza, solo se recorta
            } else {
                sanitizedData[key] = sanitizeHtml(data[key], {
                    allowedTags: [], // 🔹 No permite ninguna etiqueta HTML
                    allowedAttributes: {}, // 🔹 No permite atributos peligrosos
                    disallowedTagsMode: 'discard', // 🔹 Elimina etiquetas en lugar de escaparlas
                    enforceHtmlBoundary: true // 🔹 Evita contenido oculto dentro de etiquetas eliminadas
                }).trim();
            }
        } else {
            sanitizedData[key] = data[key]; // 🔹 Mantiene valores numéricos o booleanos sin cambios
        }
    }
    return sanitizedData;
};


// -----------📌 SCHEMAS DE VALIDACIÓN PARA CREACIÓN-----------
/**
 * 📌 Esquema base para la creación de usuarios
 * ✅ Se usa en **todas** las validaciones de registro.
 * 🔹 Valida `email`, `password`, `first_name` y `last_name`.
 */
const baseUserSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required()
        .messages({ 'string.email': 'El email no es válido', 'any.required': 'El email es obligatorio' }),

    password: Joi.string().min(8).max(32).required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'))
        .messages({
            'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
            'string.min': 'La contraseña debe tener al menos 8 caracteres',
            'any.required': 'La contraseña es obligatoria'
        }),

    first_name: Joi.string().trim().min(2).max(50).required()
        .messages({ 'string.min': 'El nombre debe tener al menos 2 caracteres', 'any.required': 'El nombre es obligatorio' }),

    last_name: Joi.string().trim().min(2).max(50).required()
        .messages({ 'string.min': 'El apellido debe tener al menos 2 caracteres', 'any.required': 'El apellido es obligatorio' }),

    role_id: Joi.number().integer().valid(3).required()
        .messages({ 'any.only': 'Rol inválido. Solo se permite Guest.', 'any.required': 'El rol es obligatorio.' })
});

/**
 * 📌 Esquema para la creación de usuarios administradores (`Usuario`).
 * ✅ Se usa en `validateUserCreation`.
 * 🔹 Solo permite `role_id = 3`.
 */
const adminUserSchema = baseUserSchema.keys({
    role_id: Joi.number().integer().valid(3).required()
        .messages({ 'any.only': 'Rol inválido. Solo se permite Guest (3).', 'any.required': 'El rol es obligatorio.' })
});

/**
 * 📌 Esquema para la creación del primer usuario (`SuperAdmin`).
 * ✅ Se usa cuando no hay usuarios en la BD.
 * 🔹 Solo permite `role_id = 2 o 3`.
 */
const superAdminUserSchema = baseUserSchema.keys({
    role_id: Joi.number().integer().valid(1, 2, 3).required()
        .messages({ 'any.only': 'Rol inválido. Solo se permite Guest (3), Admin (2) o SuperAdmin (1)', 'any.required': 'El rol es obligatorio.' })
});

/**
 * 📌 Esquema para la creación del primer usuario (`SuperAdmin`).
 * ✅ Se usa cuando no hay usuarios en la BD.
 * 🔹 Solo permite `role_id = 2 o 3`.
 */
const firstUserSchema = baseUserSchema.keys({
    role_id: Joi.number().integer().valid(1).required()
        .messages({ 'any.only': 'Rol inválido. Se necesita un Super Administrador de primero.' })
});

// -----------📌 SCHEMA DE VALIDACIÓN PARA CONSULTA DE USUARIOS-----------
 /**
 * 📌 Esquema para la validación de consultas de usuarios.
 * ✅ Se usa en el middleware antes de ejecutar la consulta en la base de datos.
 * 🔹 Permite paginación con `page` y `limit`.
 * 🔹 Filtra por `name`, `role_id` e `is_blocked`.
 * 🔹 `name` solo acepta letras y espacios.
 * 🔹 `role_id` puede ser un número entero o un array con valores permitidos.
 * 🔹 `is_blocked` solo acepta valores booleanos.
 */
const userQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1)
        .messages({ 'number.base': 'El número de página debe ser un número entero válido.', 'number.min': 'La página debe ser al menos 1.' }),

    limit: Joi.number().integer().min(1).default(10)
        .messages({ 'number.base': 'El límite debe ser un número entero válido.', 'number.min': 'El límite debe ser al menos 1.' }),

    name: Joi.string().pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).optional()
        .messages({ 'string.pattern.base': 'El nombre solo puede contener letras y espacios.' }),

    role_id: Joi.alternatives().try(
        Joi.number().integer().valid(1, 2, 3),
        Joi.array().items(Joi.number().integer().valid(1, 2, 3))
    ).optional()
        .messages({ 'number.base': 'El role_id debe ser un número entero válido.', 'any.only': 'El role_id debe ser 1 (Guest), 2 (Admin) o 3 (SuperAdmin).' }),

    is_blocked: Joi.boolean().optional()
        .messages({ 'boolean.base': 'El campo is_blocked solo puede ser verdadero o falso.' })
});


// -----------📌 SCHEMAS DE VALIDACIÓN PARA MODIFICACIÓN-----------

 /**
 * 📌 Esquema base para modificar usuarios (sin cambios de rol).
 * ✅ Se usa en `validateUserUpdate`.
 * 🔹 Permite modificar `email`, `password`, `first_name` y `last_name`.
 */
const updateBaseUserSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().optional()
        .messages({ 'string.email': 'El email no es válido' }),

    first_name: Joi.string().trim().min(2).max(50).optional()
        .messages({ 'string.min': 'El nombre debe tener al menos 2 caracteres' }),

    last_name: Joi.string().trim().min(2).max(50).optional()
        .messages({ 'string.min': 'El apellido debe tener al menos 2 caracteres' })
});

/**
 * 📌 Esquema para modificar usuarios con cambios en `role_id = 2`.
 * ✅ Se usa en `validateUserUpdate` cuando `role_id` está presente.
 */
const updateAdminUserSchema = updateBaseUserSchema.keys({
    is_blocked: Joi.boolean().optional()
        .messages({ 'boolean.base': 'El campo de bloqueo debe ser verdadero o falso' })
});

 /**
 * 📌 Esquema para modificar usuarios con cambios en `role_id = 2 o 3`.
 * ✅ Se usa en `validateUserUpdate` cuando `role_id` está presente y el usuario tiene rol de `SuperAdmin`.
 */
const updateSuperAdminUserSchema = updateBaseUserSchema.keys({
    role_id: Joi.number().integer().valid( 2, 3).optional()
        .messages({ 'any.only': 'Rol inválido. Solo se permite Guest o Admin.' }),
    is_blocked: Joi.boolean().optional()
        .messages({ 'boolean.base': 'El campo de bloqueo debe ser verdadero o falso' })
});


// -----------📌 SCHEMAS DE VALIDACIÓN PARA CHANGE/RESET PASSWORD-----------
 /**
 * 📌 Esquema para la validación de correos electrónicos.
 * ✅ Verifica que el email sea válido antes de enviar un token.
 */
const emailSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            "string.email": "El email debe tener un formato válido.",
            "any.required": "El email es obligatorio."
        })
});

 /**
 * 📌 Esquema base para la validación de contraseñas nuevas.
 * ✅ Debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número.
 */
const newPasswordSchema = Joi.object({
    new_password: Joi.string().min(8).max(32).required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'))
        .messages({ 'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
            "any.required": "La contraseña actual es obligatoria."
         }),
})
    
 /**
 * 📌 Esquema para el cambio de contraseña de un usuario autenticado.
 * ✅ Requiere la contraseña actual (`currentPassword`).
 * ✅ Valida `newPassword` con los mismos estándares de seguridad.
 */
const changePasswordSchema = newPasswordSchema.keys({
    current_password: Joi.string().required()
        .messages({ "any.required": "La contraseña actual es obligatoria." })
});


// -----------📌 SCHEMAS DE VALIDACIÓN PARA LOGIN-----------
 /**
 * 📌 Esquema de validación para el login.
 * ✅ Valida que el email sea un formato válido y que la contraseña no esté vacía.
 */
const loginSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'El email debe tener un formato válido.',
            'any.required': 'El email es obligatorio.'
        }),
    password: Joi.string().min(1).required()
        .messages({
            'string.empty': 'La contraseña no puede estar vacía.',
            'any.required': 'La contraseña es obligatoria.'
        })
});







// -----------📌 MIDDLEWARES DE VALIDACIÓN-----------
/**
 * 📌 Middleware para validar la solicitud de **Login**.
 * 🔹 Verifica que el email tenga un formato válido.
 * 🔹 Verifica que la contraseña no esté vacía.
 */
const validateLoginRequest = (req, res, next) => {
    try {
        // Validar los datos con el esquema de login
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

        if (error) {
            return serverResponse(res, { 
                status: 400, 
                success: false, 
                message: error.details[0].message
            });
        }

        req.body = value; // Asignar los valores validados al request
        next(); // Continuar con la siguiente función en la cadena
    } catch (error) {
        next(formatError(error, 'validateLoginRequest', 500, 'Error interno en la validación de login'));
    }
};

/**
 * 📌 Middleware para validar la solicitud de **envío de token de restablecimiento de contraseña**.
 * ✅ Verifica que el email sea válido antes de generar el token.
 */
const validateSendPasswordResetEmail = (req, res, next) => {
    try {
        const { error, value } = emailSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

        if (error) {
            return serverResponse(res, { status: 400, success: false, message: error.details[0].message });
        }

        req.body = value;
        next();
    } catch (error) {
        next(formatError(error, "validateSendPasswordResetEmail", 500, "Error interno en la validación del email."));
    }
};

/**
 * 📌 Middleware para validar la solicitud de **restablecimiento de contraseña**.
 * ✅ Verifica que la `newPassword` cumpla con los estándares de seguridad.
 */
const validateResetPassword = (req, res, next) => {
    try {
        const { error, value } = newPasswordSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

        if (error) {
            return serverResponse(res, { status: 400, success: false, message: error.details[0].message });
        }

        req.body = value;
        next();
    } catch (error) {
        next(formatError(error, "validateResetPassword", 500, "Error interno en la validación de restablecimiento de contraseña."));
    }
};

/**
 * 📌 Middleware para validar la solicitud de **cambio de contraseña de usuario autenticado**.
 * ✅ Verifica que la `currentPassword` esté presente.
 * ✅ Valida que la `newPassword` cumpla con los requisitos de seguridad.
 */
const validateChangePassword = (req, res, next) => {
    try {
        const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

        if (error) {
            return serverResponse(res, { status: 400, success: false, message: error.details[0].message });
        }

        req.body = value;
        next();
    } catch (error) {
        next(formatError(error, "validateChangePassword", 500, "Error interno en la validación de cambio de contraseña."));
    }
};


/**
 * 📌 Middleware para validar la **creación de usuarios**.
 * 🔹 Asigna `SuperAdmin` al primer usuario automáticamente.
 * 🔹 Elige dinámicamente el `schema` según `role_id` en la solicitud.
 */
const validateUserCreation = async (req, res, next) => {
    try {
        const totalUsers = await User.count();
        let schemaToUse;
        req.body = sanitizeInput(req.body);

        if (totalUsers === 0) {
            req.body.role_id = 1;
            schemaToUse = firstUserSchema;
        } else if (!req.rol) {
            req.body.role_id = 3;
            schemaToUse = baseUserSchema;
        } else {
            if(req.rol === 2){
                schemaToUse = adminUserSchema;
            } else if(req.rol === 1){
                schemaToUse = superAdminUserSchema;
            } else {
                schemaToUse = baseUserSchema;
            }             
        }

        const { error, value } = schemaToUse.validate(req.body, { abortEarly: false, stripUnknown: true });

        if (error) {
            return serverResponse(res, { status: 400, success: false, message: error.details[0].message });
        }

        req.body = value;
        next();
    } catch (error) {
        next(formatError(error, 'validateUserCreation-validateUser.Middlewate', 500, GENERAL.FAILURE))
    }
};

/**
 * 📌 Middleware para validar la **modificación de usuarios**.
 * 🔹 Si no se envía `role_id`, solo valida los datos básicos.
 * 🔹 Si se envía `role_id`, elige dinámicamente el esquema según el rol permitido.
 */
const validateUserUpdate = (req, res, next) => {
    try{
        let schemaToUse;

        if (req.body.role_id === undefined) {
            schemaToUse = updateBaseUserSchema;
        } else if ([1, 2].includes(req.body.role_id)) {
            schemaToUse = updateAdminUserSchema;
        } else if ([1, 2, 3].includes(req.body.role_id)) {
            schemaToUse = updateSuperAdminUserSchema;
        } else {
            return res.status(400).json({ success: false, message: ['Rol inválido.'] });
        }

        const { error } = schemaToUse.validate(req.body, { abortEarly: false, stripUnknown: true });

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        next();
    } catch (error) {
        next(formatError(error, 'validateUserUpdate', 500, 'Error interno en la validación de modificación de usuario.'));
    }
};

/**
 * 📌 Middleware para validar la **consulta de usuarios**.
 * 🔹 Valida los parámetros de la consulta antes de realizar la consulta en la base de datos.
 * 🔹 Elige dinámicamente el `schema` de validación basado en los parámetros `page`, `limit`, `name`, `role_id` e `is_blocked`.
 * 🔹 `page` y `limit` deben ser números enteros válidos.
 * 🔹 `name` solo puede contener letras y espacios.
 * 🔹 `role_id` debe ser un valor permitido (1, 2, 3) o un array de esos valores.
 * 🔹 `is_blocked` debe ser un valor booleano.
 */
const validateUserQuery = async (req, res, next) => {
    try {
        // Usamos el schema de validación para la consulta de usuarios
        const { error, value } = userQuerySchema.validate(req.query, { abortEarly: false, stripUnknown: true });

        // Si hay errores en la validación, usamos formatError para manejar el error
        if (error) {
            return next(formatError(error, 'validateUserQuery', 400, 'Errores en la validación de parámetros de consulta.'));
        }

        // Si la validación es exitosa, asignamos los valores validados a `req.query`
        req.query = value;
        next(); // Continuamos con el siguiente middleware o controlador
    } catch (error) {
        next(formatError(error, 'validateUserQuery', 500, 'Error interno en la validación de consulta de usuarios.'));
    }
};

module.exports = { validateUserCreation, validateUserUpdate, validateLoginRequest, validateChangePassword, validateResetPassword, validateSendPasswordResetEmail, validateUserQuery };