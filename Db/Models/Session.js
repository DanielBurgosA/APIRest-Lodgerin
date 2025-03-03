/* 
================ MODELO 'Session' =================

Define la estructura de la tabla `sessions` en la base de datos.

🚀 **USO**:
   - Permite manejar sesiones activas de usuarios.
   - Relacionado con `User` a través de `user_id`.
*/
module.exports = function(sequelize, DataTypes){
    return sequelize.define(
      'Session',
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          comment: 'Identificador único de la sesión'
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE',
          comment: 'Usuario que posee la sesión'
        },
        access_token: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'Token de acceso de la sesión'
        },
        refresh_token: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'Token de actualización para la sesión'
        },
        device_info: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: 'Información del dispositivo'
        },
        ip_address: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: 'Información de la IP'
        },
      },
      {
        tableName: 'sessions',
        timestamps: true,
        underscored: true,
        comment: 'Tabla que almacena sesiones activas de usuarios'
      }
    );
  };
  