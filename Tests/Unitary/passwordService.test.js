/* 
================ 🔐 PRUEBAS DE GESTIÓN DE CONTRASEÑAS ================

Este archivo contiene pruebas unitarias para verificar la funcionalidad de 
gestión de contraseñas en la aplicación, incluyendo cambios, restablecimiento 
y envío de correos de recuperación.

🛠️ **FUNCIONALIDADES PROBADAS**:
   - `changePassword` → Permite a los usuarios cambiar su contraseña actual.
   - `sendPasswordResetEmail` → Envía un correo con un token para restablecer la contraseña.
   - `resetPassword` → Permite restablecer la contraseña usando un token válido.

🎯 **OBJETIVO**:
   - Garantizar que los usuarios puedan cambiar su contraseña de manera segura.
   - Verificar que el restablecimiento de contraseña funcione correctamente.
   - Asegurar que no se envíen correos de restablecimiento a usuarios inexistentes.

✅ **ESCENARIOS CUBIERTOS**:
   - Cambio de contraseña exitoso. 🔄
   - Intento de cambio con contraseña actual incorrecta. 🚫
   - Intento de cambio con un usuario inexistente. ❌
   - Envío de correo de restablecimiento (mockeado). 📧
   - Intento de restablecimiento con un usuario no registrado. ⚠️
   - Restablecimiento exitoso de la contraseña. 🔓
*/

const { changePassword, resetPassword, sendPasswordResetEmail } = require('../../src/Services/passwordService');
const bcrypt = require('bcrypt');
const { generateResetToken } = require('../../src/Helpers/jwtHelper');
const { sendEmail } = require('../../src/Helpers/emailHelper');

jest.mock('../../Db/db.config', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../src/Helpers/emailHelper', () => ({
  sendEmail: jest.fn(), // Mockeamos para que no se envíen correos reales
}));

const { User } = require('../../Db/db.config');

describe('🔐 Pruebas de Gestión de Contraseñas', () => {
  let mockUser;
  let hashedPassword;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('validPassword', 10);
    mockUser = {
      id: 1,
      email: 'test@email.com',
      password: hashedPassword,
      reset_password_token: null,
      reset_password_token_used: false,
      update: jest.fn(),
    };
  });

  // ---------------- CAMBIO DE CONTRASEÑA ----------------
  test('✅ Cambio de contraseña exitoso', async () => {
    User.findByPk.mockResolvedValue(mockUser);

    const result = await changePassword(mockUser.id, {
      currentPassword: 'validPassword',
      newPassword: 'newSecurePassword123',
    });

    expect(result.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
  });

  test('❌ No debe permitir cambiar contraseña con contraseña actual incorrecta', async () => {
    User.findByPk.mockResolvedValue(mockUser);

    const result = await changePassword(mockUser.id, {
      currentPassword: 'wrongPassword',
      newPassword: 'newSecurePassword123',
    });

    expect(result.status).toBe(401);
    expect(result.success).toBe(false);
  });

  test('❌ No debe permitir cambiar contraseña si el usuario no existe', async () => {
    User.findByPk.mockResolvedValue(null);

    const result = await changePassword(999, {
      currentPassword: 'validPassword',
      newPassword: 'newSecurePassword123',
    });

    expect(result.status).toBe(404);
    expect(result.success).toBe(false);
  });

  // ---------------- RESTABLECIMIENTO DE CONTRASEÑA ----------------
  test('✅ Debe enviar un correo de restablecimiento de contraseña (sin enviarlo realmente)', async () => {
    User.findOne.mockResolvedValue(mockUser);
    sendEmail.mockResolvedValue(true); // Simulamos el éxito

    const result = await sendPasswordResetEmail(mockUser.email);

    expect(result.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.body).toHaveProperty('resetToken');
    expect(sendEmail).toHaveBeenCalled(); // Aseguramos que la función fue llamada, pero sin enviar
  });

  test('❌ No debe enviar correo de restablecimiento si el usuario no existe', async () => {
    User.findOne.mockResolvedValue(null);

    const result = await sendPasswordResetEmail('unknown@email.com');

    expect(result.status).toBe(404);
    expect(result.success).toBe(false);
  });

  test('✅ Debe restablecer la contraseña correctamente', async () => {
    User.findOne.mockResolvedValue(mockUser);

    const result = await resetPassword(mockUser, 'newSecurePassword123');

    expect(result.status).toBe(200);
    expect(result.success).toBe(true);
  });
});