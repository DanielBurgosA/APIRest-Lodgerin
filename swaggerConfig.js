/* 
================ SWAGGER CONFIG =================

Configura la documentación de la API usando Swagger.

🚀 **USO**:
   - Genera documentación interactiva para la API.
   - Permite probar los endpoints directamente desde el navegador.
   - Facilita la integración y entendimiento de la API para otros desarrolladores.

✅ **ACCESO**:
   - La documentación estará disponible en `/api-docs` una vez que se inicie el servidor.
*/

// -----------📦 IMPORTACIONES----------
const swaggerJSDoc = require('swagger-jsdoc'); //Genera la documentación en formato OpenAPI
const swaggerUI = require('swagger-ui-express'); //Renderiza la documentación en una interfaz web
require('dotenv').config(); //Variables de entorno

// ----------- ⚙️ CONFIGURACIÓN DEL PUERTO -----------
const api_port = process.env.PORT || 4001;

/* 
================ CONFIGURACIÓN SWAGGER =================

🔹 `openapi`: Define la versión del estándar OpenAPI utilizada.
🔹 `info`: Contiene metadatos sobre la API (nombre, versión y descripción).
🔹 `servers`: Lista de servidores en los que la API puede ser accedida.
🔹 `apis`: Define los archivos donde se documentan los endpoints.

📌 **IMPORTANTE**:
   - Asegúrate de que `apis` incluya el path correcto de tus archivos de rutas.
   - Agrega comentarios en los endpoints usando la sintaxis Swagger para que sean detectados automáticamente.
*/
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Usuarios y Roles', // Título de la API en la documentación
      version: '1.0.0', // Versión de la API
      description: 
        '🔥 ¡Bienvenido a la API de Lodgerin! 🔥\n\n' +
        'Esta API te permite gestionar usuarios, roles y autenticación de manera segura y eficiente.\n\n' +
        '⚡ **Explora, prueba y desarrolla con facilidad**.\n' +
        '📚 **Endpoints bien documentados para una integración sin fricciones**.\n' +
        '🔐 **Autenticación con JWT y sistema de permisos basado en roles**.\n' +
        '📩 **Recuperación de contraseña con envío de correo real**.\n\n' +
        '🚀 **¡Cómo empezar!**\n' +
        '⚠️ **IMPORTANTE:** Para usar la API correctamente, sigue las instrucciones de inicio en el `README` de GitHub \n\n'+
        '1️⃣ El primer usuario que realices un `signIn` será el **SuperAdministrador** y tendrá control total.\n\n' +
        '2️⃣ Para acceder a los endpoints protegidos, debes incluir un **JWT Token válido** en `BearerAuth`.\n\n' +
        '3️⃣ Si olvidas tu contraseña, usa `password/reset`, que enviará un correo real con el token de restablecimiento. 📧\n\n' +
        '🔒 **Autenticación y Seguridad**\n' +
        '✅ Todos los endpoints protegidos requieren un **JWT Token**.\n' +
        '✅ El token de acceso dura **1 hora**, el refresh token dura **2 horas**.\n' +
        '✅ Al iniciar sesión o restablecer contraseña, los tokens se incluyen en el `body` para copiar y pegar fácilmente.\n\n' +
        '👑 **Gestión de Roles**\n' +
        '🔹 **Solo el SuperAdministrador** puede cambiar roles.\n' +
        '🔹 Un Admin puede gestionar usuarios, pero no asignar roles.\n' +
        '🔹 Los usuarios estándar solo pueden gestionar su propia cuenta.\n\n' +
        '📖 **Más Información**\n' +
        'Para instrucciones detalladas sobre instalación y uso, consulta el `README` en el repositorio de GitHub. 📝\n\n' +
        '⚠️ **IMPORTANTE:** Para usar la API correctamente, sigue las instrucciones de inicio en el `README` de GitHub y recuerda los IDs de los roles:\n' +
        '   - **1 → SuperAdmin**\n' +
        '   - **2 → Admin**\n' +
        '   - **3 → Guest**\n'
    },
    servers: [
      {
        url: `http://localhost:${api_port}`, // URL base del servidor en desarrollo
        description: 'Servidor de desarrollo',
      },
    ],
    tags: [
      { name: 'SignIn', description: 'Endpoint de SignIn, cuando la base esta vacia eell primer SignIn creará un Super Administrador para poder hacer pruebas' },
      { name: 'LogIn', description: 'Endpoint de autenticación y LogIn' },
      { name: 'Password', description: 'Endpoint de admnistración de contraseñas, incluye envio de mails, reinicio y cambio de contraseña' },
      { name: 'Guest', description: 'Endpoints accesibles para usuarios Guest' },
      { name: 'Admin', description: 'Endpoints accesibles para usuarios Admin' },
    ],
    
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token de autenticación para usuarios autenticados.",
        },
        RefreshToken: {
          type: "apiKey",
          in: "header",
          name: "x-refresh-token",
          description: "Token de actualización para obtener nuevos tokens de acceso.",
        },
        ResetToken: { 
          type: "apiKey",
          in: "header",
          name: "x-reset-token",
          description: "Token de restablecimiento de contraseña, recibido en el correo.",
        },
      },
    },
    security: [
      { BearerAuth: [] },
      { RefreshToken: [] },
    ],
  },
  apis: ['./src/Router/*.js', './src/Router/*/*.js'], // Ubicación de los archivos con rutas documentadas
};

// ----------- GENERACIÓN DEL ESQUEMA SWAGGER -----------
const swaggerSpec = swaggerJSDoc(options);

// ----------- EXPORTACIÓN -----------

module.exports = { swaggerUI, swaggerSpec };