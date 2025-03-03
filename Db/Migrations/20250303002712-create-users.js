'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      is_blocked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      reset_password_token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: ''
      },
      reset_password_token_used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      created_at: { // ✅ Tiene un valor por defecto
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: { // ✅ Se actualiza automáticamente con un trigger
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface) {
    // ✅ Eliminar el trigger antes de eliminar la tabla
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS update_timestamp_users ON users;`);
    await queryInterface.dropTable('users');
  }
};