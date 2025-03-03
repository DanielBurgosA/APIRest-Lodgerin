/* 
================SERVIDOR PRINCIPAL================
Este archivo inicializa y configura el servidor Express.

🚀 **USO**:
   - Se encarga de inicializar el servidor y aplicar configuraciones globales.
   - Carga middlewares de seguridad y CORS.
   - Define rutas principales y maneja errores.
*/

// -----------📦 IMPORTACIONES-----------
const express = require('express'); //Framework para servidores web.
const cors = require('cors'); //Middleware para permitir CORS (Cross-Origin Resource Sharing).
const helmet = require('helmet'); //Middleware de seguridad.
const http = require('http'); // Módulo para crear el servidor HTTP .
const router = require('./Router/router.config.js'); //Enrutador principal 
const { serverResponse, errorHandler } = require('./Utils/responseUtils'); //Funciones de estandarizaci´no
const { GENERAL } = require('./Utils/messages.js'); //Mensajes estandarizados
const { swaggerUI, swaggerSpec } = require('../swaggerConfig'); //Importación para implementar Swagger
require('dotenv').config(); //Variables de entorno

//-----------CONFIGURACIÓN DEL SERVIDOR EXPRESS-----------
const app = express();


// ----------- CONFIGURACIONES DE SEGURIDAD Y CORS ----------
 /**
 * Configuración de CORS para permitir solicitudes desde orígenes autorizados.
 * - `origin`: Determina los orígenes permitidos en función del entorno.
 * - `optionsSuccessStatus`: Define el código de estado para respuestas exitosas de opciones.
 * - `methods`: Lista de métodos HTTP permitidos.
 * - `allowedHeaders`: Encabezados permitidos en las solicitudes.
 * - `exposedHeaders`: Encabezados visibles en la respuesta.
 */
const corsOptions = {
    origin: process.env.NODE_ENV === 'development' ? true : (process.env.PROD_CORS_ORIGIN === '*' ? true : process.env.PROD_CORS_ORIGIN),
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token', 'x-reset-token'], 
    exposedHeaders: ['x-new-token', 'x-new-refresh-token']
};
app.use(cors(corsOptions));

 // Middleware de seguridad con Helmet (desactiva CSP solo en pruebas)
app.use(helmet({ contentSecurityPolicy: false }));

 // Middleware para procesar JSON en las solicitudes
app.use(express.json({ limit: '10mb' }));


//-----------CONFIGURACIÓN DE RUTAS Y MANEJO DE ERRORES-----------
 // Carga del enrutador principal
app.use( router);

    // 🚀 SWAGGER DOCUMENTATION 
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

 // Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
    return serverResponse(res, { status: 404, success: false, message: GENERAL.NOT_FOUND });
});

 // Middleware global para manejo de errores
app.use(errorHandler);

//-----------CREACIÓN Y EXPORTACIÓN DEL SERVIDOR HTTP-----------
const server = http.createServer(app);
module.exports = { server };