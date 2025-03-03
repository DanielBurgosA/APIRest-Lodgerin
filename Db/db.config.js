/* 
================ CONFIGURACIÓN DE BASE DE DATOS =================

Este archivo establece la conexión con la base de datos especificada en 
las variables de entorno y carga los modelos de la aplicación.

🚀 **USO**:
   - Crea la conexión con PostgreSQL utilizando las variables de entorno.
   - Define opciones de conexión, como pool de conexiones y desactivación de logs.
   - Inicializa los modelos y exporta la conexión junto con los modelos.
*/

// -----------📦 IMPORTACIONES----------
const { Sequelize } = require('sequelize'); //ORM para gestionar la base de datos.
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env; //Función que inicializa los modelos en la base de datos.
const initModels = require('./init-models'); // Función para inicializar los modelos

// ----------- 🚀 CREACIÓN DE CONEXIÓN A LA BASE DE DATOS -----------
const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10) || 5432,
    dialect: 'postgres',
    define: {
      timestamps: true
    },
    logging: false,
    pool: {
        max: 10,
        min: 1,
        acquire: 30000,
        idle: 10000
    }
  });

// ----------- 🔗 INICIALIZACIÓN DE MODELOS -----------
initModels(db);

module.exports = { db, ...db.models };