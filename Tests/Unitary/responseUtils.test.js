/* 
================ 🚨 PRUEBAS DE MANEJO DE RESPUESTAS Y ERRORES ================

Este archivo contiene pruebas unitarias para la gestión de respuestas y errores en la aplicación.
Incluye validaciones para formateo de errores, manejo de respuestas HTTP y captura de errores.

🛠️ **FUNCIONALIDADES PROBADAS**:
   - `formatError` → Estandariza el formato de los errores antes de ser enviados.
   - `serverResponse` → Envía respuestas HTTP con un formato consistente.
   - `errorHandler` → Middleware global para capturar errores en Express.

🎯 **OBJETIVO**:
   - Garantizar que los errores se formateen correctamente antes de ser enviados.
   - Asegurar que las respuestas HTTP sigan un formato estándar.
   - Verificar que el middleware de errores capture y maneje correctamente las excepciones.

✅ **ESCENARIOS CUBIERTOS**:
   - Formatear un error correctamente. 🔄
   - No volver a registrar errores ya impresos en consola. 🛑
   - Enviar una respuesta JSON con formato adecuado. 📤
   - Enviar una respuesta sin mensaje ni cuerpo cuando no se pasan datos. ⚙️
   - Capturar errores con `errorHandler` y enviar una respuesta HTTP adecuada. 🛠️
*/


const { serverResponse, formatError, errorHandler } = require('../../src/Utils/responseUtils');

describe('🚨 Pruebas de Manejo de Respuestas y Errores', () => {
  let errorMock, consoleSpy, resMock;

  beforeEach(() => {
    errorMock = new Error('Error de prueba');
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Evita logs en los tests

    // Mock de res de Express
    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    consoleSpy.mockRestore(); // Restaurar consola
  });

  // ---------------- TESTS DE FORMATERROR ----------------
  test('✅ Devuelve un error con formato estándar', () => {
    const formattedError = formatError(errorMock, 'testLocation');

    expect(formattedError).toHaveProperty('status', 500);
    expect(formattedError).toHaveProperty('message', 'Error interno del servidor');
    expect(formattedError).toHaveProperty('consoled', true);
  });

  test('✅ No vuelve a imprimir en consola si el error ya fue registrado', () => {
    errorMock.consoled = true;
    formatError(errorMock, 'testLocation');

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // ---------------- TESTS DE SERVERRESPONSE ----------------
  test('✅ Devuelve una respuesta JSON con el formato correcto', () => {
    serverResponse(resMock, { status: 200, success: true, message: 'OK', body: { data: 'test' } });

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({ success: true, message: 'OK', body: { data: 'test' } });
  });

  test('✅ Devuelve respuesta sin mensaje ni body cuando no se pasan', () => {
    serverResponse(resMock, { status: 204, success: true });

    expect(resMock.status).toHaveBeenCalledWith(204);
    expect(resMock.json).toHaveBeenCalledWith({ success: true });
  });

  // ---------------- TESTS DE ERRORHANDLER ----------------
  test('✅ Captura errores y usa serverResponse correctamente', () => {
    const reqMock = {};
    const nextMock = jest.fn();

    errorHandler(errorMock, reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error de prueba',
    });
  });
});