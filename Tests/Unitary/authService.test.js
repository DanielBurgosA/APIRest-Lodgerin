/* 
================ 🔐 PRUEBAS DE AUTENTICACIÓN ================

Este archivo contiene pruebas unitarias para la autenticación de usuarios en la aplicación.
Incluye validaciones para el inicio de sesión, cierre de sesión y manejo de errores.

🛠️ **FUNCIONALIDADES PROBADAS**:
   - `authenticateUser` → Valida las credenciales del usuario y genera tokens de sesión.
   - `logoutUser` → Cierra la sesión eliminando la sesión activa en la base de datos.

🎯 **OBJETIVO**:
   - Verificar que los usuarios puedan iniciar sesión con credenciales válidas.
   - Asegurar que las sesiones se manejen correctamente en la base de datos.
   - Probar el cierre de sesión y la eliminación de tokens activos.
   - Validar el manejo de errores en autenticación y cierre de sesión.

✅ **ESCENARIOS CUBIERTOS**:
   - Autenticación exitosa con credenciales correctas. 🔓
   - Rechazo de autenticación con contraseña incorrecta. 🚫
   - Rechazo de autenticación con usuario inexistente. ❌
   - Cierre de sesión exitoso. 🔄
   - Intento de cierre de sesión con token inválido. ⚠️
   - Error en la base de datos al autenticar usuario. 🛑
   - Error en la base de datos al intentar cerrar sesión. ⚡
   - Error al eliminar la sesión en el cierre de sesión. ❗
*/

const { authenticateUser, logoutUser } = require('../../src/Services/authServices');
const { generateToken } = require('../../src/Helpers/jwtHelper');
const bcrypt = require('bcrypt');

jest.mock('../../Db/db.config', () => ({
  User: {
    findOne: jest.fn(),
  },
  Session: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

const { User, Session } = require('../../Db/db.config');

describe('🔐 Pruebas de Autenticación', () => {
  let mockUser;
  let hashedPassword;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('validPassword', 10);
    mockUser = {
      id: 1,
      email: 'test@email.com',
      password: hashedPassword,
    };
  });

  test('✅ Autenticar usuario con credenciales correctas', async () => {
    User.findOne.mockResolvedValue(mockUser);
    Session.findAll.mockResolvedValue([]);
    Session.create.mockResolvedValue({});

    const result = await authenticateUser({
      email: 'test@email.com',
      password: 'validPassword',
      ip_address: '127.0.0.1',
      device_info: 'Test Device',
    });

    expect(result.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.body).toHaveProperty('token');
    expect(result.body).toHaveProperty('refreshToken');
  });

  test('❌ Rechazar autenticación con contraseña incorrecta', async () => {
    User.findOne.mockResolvedValue(mockUser);

    const result = await authenticateUser({
      email: 'test@email.com',
      password: 'wrongPassword',
    });

    expect(result.status).toBe(401);
    expect(result.success).toBe(false);
  });

  test('❌ Rechazar autenticación con usuario inexistente', async () => {
    User.findOne.mockResolvedValue(null);

    const result = await authenticateUser({
      email: 'unknown@email.com',
      password: 'validPassword',
    });

    expect(result.status).toBe(401);
    expect(result.success).toBe(false);
  });

  test('✅ Cerrar sesión correctamente', async () => {
    const validToken = generateToken(mockUser);
    Session.findOne.mockResolvedValue({ destroy: jest.fn() });

    const result = await logoutUser(validToken);

    expect(result.status).toBe(200);
    expect(result.success).toBe(true);
  });

  test('❌ Intentar cerrar sesión con token inválido', async () => {
    Session.findOne.mockResolvedValue(null);

    const result = await logoutUser('invalidToken');

    expect(result.status).toBe(404);
    expect(result.success).toBe(false);
  });

  test('❌ Error en la base de datos al autenticar usuario', async () => {
    User.findOne.mockRejectedValue(new Error('Database connection error'));
  
    await expect(authenticateUser({ email: 'test@email.com', password: 'validPassword' }))
      .rejects.toThrow(/La operación no pudo completarse/); // Verificar el mensaje procesado
  });

  test('❌ Error en la base de datos al intentar cerrar sesión', async () => {
    Session.findOne.mockRejectedValue(new Error('DB error en sesión'));
  
    await expect(logoutUser('validToken'))
      .rejects.toThrow(/La operación no pudo completarse/);
  });
  
  test('❌ Error al eliminar sesión en logout', async () => {
    Session.findOne.mockResolvedValue({
      destroy: jest.fn().mockRejectedValue(new Error('Error eliminando sesión')),
    });
  
    await expect(logoutUser('validToken'))
      .rejects.toThrow(/La operación no pudo completarse/);
  });
});