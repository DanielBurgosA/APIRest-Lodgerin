/* 
================ MENSAJES ESTANDARIZADOS ================

Este archivo contiene mensajes predefinidos para respuestas de la API,
permitiendo una mejor organización y reutilización.

📦 **CATEGORÍAS**:
   - `AUTH` → Mensajes relacionados con autenticación y autorización.
   - `USER` → Mensajes de usuario (creación, recuperación de contraseña, etc.).
   - `ADMIN` → Mensajes de administración de usuarios.
   - `GENERAL` → Mensajes de propósito general en la API.

🚀 **USO**:
   - Se utiliza en controladores y middlewares para respuestas consistentes.
   - Evita repetir mensajes en múltiples partes del código.
*/

const messages = {
    // Mensajes relacionados con autenticación y autorización.
    AUTH: {
        NO_TOKEN: 'Sin autorización',
        INVALID_TOKEN: 'Token inválido',
        FORBIDDEN: 'No tienes permisos para acceder a este recurso',
        UNAUTHORIZED: 'Acceso no permitido',
        ACCESS_DENIED: 'No autorizado',
        INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
        BLOCKED: 'Su cuenta está bloqueada. Contacte al administrador.',
        RESET_INVALID: 'Este enlace de restablecimiento de contraseña expiró, o ya ha sido utilizado. Por favor, solicita un nuevo enlace.',
        SESSION_NOT_FOUND: "No se encontró una sesión activa. Es posible que ya haya cerrado sesión.",
        LOGOUT_SUCCESS: "Sesión cerrada correctamente. ¡Hasta pronto!",
    },
    // Mensajes relacionados con operaciones de usuario.
    USER: {
        NOT_FOUND: 'Usuario no encontrado',
        CREATED: 'Usuario creado exitosamente',
        EXISTED_ERROR:'El suario ya existe',
        PASSWORD_CHANGED_SUCCES: 'Contraseña cambiada exitosamente',
        PASSWORD_RESET_SUCCESS: "Contraseña restablecida con éxito.",
        PASSWORD_RESET_FAILED: 'Error al restablecer la contraseña',
        RESET_EMAIL_SENT: "Correo de restablecimiento de contraseña enviado exitosamente.",
        EMAIL_EXIST: "Correo en uso, intente con otro correo por favor."
    },
    // Mensajes utilizados en operaciones de administración de usuarios.
    ADMIN: {
        UPDATED: 'Datos del usuario actualizados correctamente',
        BLOCKED: 'Usuario bloqueado exitosamente',
        UNBLOCKED: 'Usuario desbloqueado exitosamente'
    },
    // Mensajes de uso general en la API.
    GENERAL: {
        SERVER_ERROR: 'Error interno del servidor',
        SUCCESS: 'Operación realizada con éxito',
        FAILURE: 'La operación no pudo completarse',
        MAINTENANCE: 'El sistema está actualmente en mantenimiento.',
        NOT_FOUND: 'Ruta no encontrada'
    }
};

module.exports = messages;