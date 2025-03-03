/* 
================ INICIALIZACIÓN DEL SERVIDOR =================

Este archivo principal inicializa el servidor y gestiona la conexión 
a la base de datos, asegurando que la API esté operativa.

📦 **IMPORTACIONES**:
   - `dotenv`: Carga las variables de entorno desde el archivo `.env`.
   - `server`: Instancia del servidor Express configurado en `src/server.js`.
   - `db`: Conexión a la base de datos establecida en `Db/db.config.js`.

🚀 **USO**:
   - Autentica la conexión con la base de datos antes de iniciar el servidor.
   - Escucha en el puerto definido en `.env` o usa el valor predeterminado `4001`.
   - Maneja errores en la conexión a la base de datos.
*/

// -----------📦 IMPORTACIONES----------
require('dotenv').config(); //Variables de entorno
const { server } = require('./src/server'); // Instacia del servidor
const { db } = require('./Db/db.config'); //Instancia de la base de datos

// ----------- ⚙️ CONFIGURACIÓN DEL PUERTO -----------
const api_port = process.env.PORT || 4001;

// ----------- 🚀 INICIALIZACIÓN DEL SERVIDOR Y BASE DE DATOS -----------
 /**
 * Función asíncrona que:
 * - Establece la conexión con la base de datos.
 * - Inicia el servidor Express en el puerto configurado.
 * - Maneja errores en la conexión.
 */
const startServer = async () => {
    try {
        await db.authenticate();
        console.log('Conexión a la base de datos establecida con éxito.');
    
        server.listen(api_port, () => {
            console.log(`Servidor corriendo en http://localhost:${api_port}`);
        });
    } catch (err) {
        console.error('No se pudo conectar a la base de datos:', err);
    }
};

// Llamada a la función para iniciar el servidor
startServer();