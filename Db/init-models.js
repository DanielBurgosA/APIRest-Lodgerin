/* 
================ INICIALIZACIÓN DE MODELOS =================

Este archivo inicializa los modelos de la base de datos y define sus relaciones.

🚀 **USO**:
   - `initModels(sequelize)`: Recibe una instancia de Sequelize e inicializa los modelos.
   - Define las asociaciones entre los modelos (relaciones).
   - Retorna un objeto con los modelos inicializados.
*/

// -----------📦 IMPORTACIONES----------
const { DataTypes } = require('sequelize') // DataTypes`: Tipos de datos de Sequelize.
const _Role = require('./Models/Role') // _Role`: Modelo de roles definido en `Models/Role.js.
const _User = require('./Models/User') // _User`: Modelo de usuarios definido en `Models/User.js`
const _Session = require('./Models/Session') // _User`: Modelo de usuarios definido en `Models/User.js`

/**
 * Inicializa los modelos y define sus relaciones en la base de datos.
 *
 * @param {Object} db - Instancia de Sequelize con la conexión a la base de datos.
 * @returns {Object} Modelos inicializados con sus relaciones.
 */
const initModels = (db) => {
    const Role = _Role(db, DataTypes)
    const User = _User(db, DataTypes)
    const Session = _Session(db, DataTypes)

    // ----------- 🔗 DEFINICIÓN DE RELACIONES -----------
    Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
    
    User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions', onDelete: 'CASCADE' });
    Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    return {User, Role, Session}
}

module.exports = initModels;