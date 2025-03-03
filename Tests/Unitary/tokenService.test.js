/* 
================ 🔐 PRUEBAS DE MANEJO DE TOKENS JWT ================

Este archivo contiene pruebas unitarias para la generación, verificación y validación 
de tokens JWT en la aplicación. Se incluyen pruebas para tokens de autenticación, 
refresh tokens y tokens de restablecimiento de contraseña.

🛠️ **FUNCIONALIDADES PROBADAS**:
   - `generateToken` → Genera un token JWT de autenticación.
   - `verifyToken` → Verifica la validez de un token JWT.
   - `generateRefreshToken` → Crea un refresh token para renovar sesiones.
   - `verifyRefreshToken` → Valida un refresh token.
   - `generateResetToken` → Genera un token de restablecimiento de contraseña.
   - `verifyResetToken` → Verifica un token de restablecimiento.

🎯 **OBJETIVO**:
   - Asegurar que los tokens se generen correctamente.
   - Verificar que los tokens válidos sean aceptados.
   - Confirmar que los tokens inválidos o expirados sean rechazados.
   - Garantizar que los refresh tokens y reset tokens funcionen como se espera.

✅ **ESCENARIOS CUBIERTOS**:
   - Generar un token JWT válido. 🔑
   - Verificar un token JWT válido. ✅
   - Intentar verificar un token inválido. 🚫
   - Generar y verificar un refresh token. 🔄
   - Intentar verificar un refresh token inválido. ❌
   - Generar y verificar un reset token. 🔓
   - Intentar verificar un reset token inválido. ⚠️
   - Intentar verificar un token expirado. ⏳
*/


const {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
} = require('../../src/Helpers/jwtHelper')
const jwt = require('jsonwebtoken');
  
describe('🔐 Pruebas de manejo de tokens JWT', () => {
  let validToken;
  let invalidToken = 'invalid.token.string';
  let userMock = { id: 1, first_name: 'TestUser' };

  beforeAll(() => {
    validToken = generateToken(userMock);
  });

  test('✅ Generar un token válido', () => {
    expect(validToken).toBeDefined();
    expect(typeof validToken).toBe('string');
  });

  test('✅ Verificar un token válido', () => {
    const result = verifyToken(validToken, null);
    expect(result).toHaveProperty('user');
    expect(result.user).toHaveProperty('id', userMock.id);
    expect(result.user).toHaveProperty('username', userMock.first_name);
  });

  test('❌ Verificar un token inválido debería lanzar error', () => {
    expect(() => verifyToken(invalidToken, null)).toThrow('Invalid or expired token');
  });

  test('✅ Generar y verificar un refresh token', () => {
    const refreshToken = generateRefreshToken(userMock);
    expect(refreshToken).toBeDefined();
    expect(typeof refreshToken).toBe('string');

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded).toHaveProperty('id', userMock.id);
    expect(decoded).toHaveProperty('username', userMock.first_name);
  });

  test('❌ Verificar un refresh token inválido debería lanzar error', () => {
    expect(() => verifyRefreshToken(invalidToken)).toThrow('Invalid or expired token');
  });

  test('✅ Generar y verificar un reset token', () => {
    const resetToken = generateResetToken(userMock);
    expect(resetToken).toBeDefined();
    expect(typeof resetToken).toBe('string');

    const decoded = verifyResetToken(resetToken);
    expect(decoded).toHaveProperty('id', userMock.id);
    expect(decoded).toHaveProperty('username', userMock.first_name);
  });

  test('❌ Verificar un reset token inválido debería lanzar error', () => {
    expect(() => verifyResetToken(invalidToken)).toThrow('Invalid or expired token');
  });

  test('❌ Verificar un token expirado debería lanzar error', async () => {
    const shortLivedToken = jwt.sign(
      { user: { id: userMock.id, username: userMock.first_name } },
      process.env.JWT_SECRET,
      { expiresIn: '1s' }
    );
  
    await new Promise((resolve) => setTimeout(resolve, 2000));
  
    expect(() => verifyToken(shortLivedToken, null)).toThrow('Invalid or expired token');
  });
});