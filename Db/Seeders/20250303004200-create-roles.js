'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      { name: 'SuperAdmin' },
      { name: 'Admin' },
      { name: 'Guest' }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {}); // Elimina todos los roles
  }
};