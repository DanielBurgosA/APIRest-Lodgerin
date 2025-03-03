/* 
================ MODELO 'User' =================

Define la estructura de la tabla `users` en la base de datos.

🚀 **USO**:
   - Representa a los usuarios del sistema con información personal y de acceso.
   - Relacionado con `Role` a través de `role_id`.
*/

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único del usuario'
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        comment: 'Correo electrónico único del usuario'
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Contraseña encriptada del usuario'
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Primer nombre del usuario'
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Apellido del usuario'
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        comment: 'Identificador del rol asociado al usuario'
      },
      is_blocked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false, 
          comment: 'Indica si la cuenta del usuario está bloqueada'
      },
      reset_password_token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '',
        comment: 'Token para restablecer la contraseña'
      },
      reset_password_token_used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el token de restablecimiento ya fue utilizado'
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      underscored: true,
      comment: 'Tabla que almacena la información de los usuarios del sistema'
    }
  );
  
  // Hook después de crear un usuario (para asignar created_by con su propio id)
  User.afterCreate(async (user, options) => {
    if (!user.created_by) {
      await user.update({ created_by: user.id, updated_by: user.id });
    }
  });

  return User
};