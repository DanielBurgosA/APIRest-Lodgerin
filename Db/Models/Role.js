/* 
================ MODELO 'Role' =================

Define la estructura de la tabla `roles` en la base de datos.

🚀 **USO**:
   - Se utiliza para gestionar los roles de usuario dentro del sistema.
   - Relacionado con `User` a través de `role_id`.
*/
const { Sequelize } = require('sequelize')

module.exports = function(sequelize, DataTypes){
  return sequelize.define(
    'Role',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único del rol'
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        comment: 'Nombre del rol (Ej: Administrador, Usuario, Invitado)'
      },
    },
    {
      tableName: 'roles',
      timestamps: true,
      underscored: true,
      comment: 'Tabla que almacena los roles de usuario en el sistema'
    }
  );
};