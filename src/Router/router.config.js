/* 
================ CONFIGURACIÓN DE RUTAS =================

Este archivo configura el enrutador principal del servidor, 
organizando las rutas según el modelo que se va a usar.

🚀 **USO**:
   - Define el enrutador principal y permite la configuración de rutas en archivos separados.
   - Aplica middlewares de seguridad, autenticación y control de tráfico.
*/

// -----------📦 IMPORTACIONES-----------
const express = require('express'); // Framework para la creación de rutas y manejo de solicitudes HTTP.
const { authenticateToken } = require('../Middlewares/auth.middleware');  // Middlewares de autenticación.
const rateLimit = require('express-rate-limit'); // Middlewares de segurdiad anti fuerza.

// -----------📦 IMPORTACION DE RUTAS-----------
const signInRouter = require('./signIn.Router')
const logInRouter = require('./logIn.Router')
const passwordRouter = require('./password.Router')
const guestRouter = require('./guest.Router')
const adminRouter = require('./admin.Router.')


// ----------- 🔗 CONFIGURACIÓN DE LIMITADOR DE PETICIONES -----------
/**
 * Middleware para limitar la cantidad de solicitudes desde una misma IP.
 * Previene ataques de fuerza bruta y abusos en las solicitudes HTTP.
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas solicitudes desde esta IP, intenta nuevamente más tarde.',
});

// ----------- 🚀 CONFIGURACIÓN DEL ROUTER -----------
const router = express.Router();
router.use(limiter);

// 📌 Rutas
router.use('/signin', signInRouter)
router.use('/session', logInRouter)
router.use('/password', passwordRouter)
router.use('/guest', authenticateToken(3), guestRouter)
router.use('/admin', authenticateToken(2), adminRouter)

module.exports = router;