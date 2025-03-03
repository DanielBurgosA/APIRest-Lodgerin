/* 
================ 👤 PRUEBAS DE USUARIO Y PERMISOS ================

Este archivo contiene pruebas unitarias para la gestión de usuarios en la aplicación,
incluyendo creación, consulta, actualización y validaciones de permisos por roles.

🛠️ **FUNCIONALIDADES PROBADAS**:
   - `createUser` → Crea nuevos usuarios con validaciones de rol.
   - `getAllUsers` → Obtiene la lista de usuarios según permisos del solicitante.
   - `getUserById` → Obtiene información de un usuario específico según permisos.
   - `updateUser` → Permite actualizar datos de usuario con restricciones de rol.

🎯 **OBJETIVO**:
   - Verificar que solo usuarios autorizados puedan crear, ver y actualizar usuarios.
   - Validar restricciones de permisos para Guests y Admins en la gestión de usuarios.
   - Garantizar que los SuperAdmins puedan gestionar cualquier usuario.

✅ **ESCENARIOS CUBIERTOS**:
   - Crear un usuario con rol válido (SuperAdmin/Admin). ✅
   - Rechazar la creación de usuario si el email ya existe. 🚫
   - Restringir la creación de usuarios para Guest. ❌
   - Obtener todos los usuarios según permisos de rol. 📋
   - Restringir a Guest la visualización de otros usuarios. 🔒
   - Permitir que Admins vean SubAdmins y Guests. 🔍
   - Permitir que SuperAdmins vean cualquier usuario. 🏆
   - Restringir la actualización de usuarios a Guest. 🛑
   - Permitir que Admins actualicen SubAdmins. 🔄
*/

const { createUser, getAllUsers, getUserById, updateUser } = require('../../src/Services/userService');
const bcrypt = require('bcrypt');

jest.mock('../../Db/db.config', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    findAndCountAll: jest.fn()
  },
  Role: {
    findByPk: jest.fn(),
  }
}));

const { User } = require('../../Db/db.config');

describe('👤 Pruebas de Usuario y Permisos', () => {
    let mockUser;
    let hashedPassword;

    beforeAll(async () => {
        hashedPassword = await bcrypt.hash('validPassword', 10);
        mockUser = {
        id: 1,
        email: 'test@email.com',
        password: hashedPassword,
        role_id: 1, // SuperAdmin
        update: jest.fn(),
        };
    });

    // ---------------- CREACIÓN DE USUARIO ----------------
    test('✅ Crear usuario exitosamente (SuperAdmin o Admin)', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(mockUser);

        const result = await createUser(
        {
            email: 'new@email.com',
            password: 'securePass123',
            first_name: 'John',
            last_name: 'Doe',
            role_id: 2,
        },
        mockUser // SuperAdmin
        );

        expect(result.status).toBe(201);
        expect(result.success).toBe(true);
    });

    test('❌ No debe permitir crear usuario con email existente', async () => {
        User.findOne.mockResolvedValue(mockUser);

        const result = await createUser(
        { email: mockUser.email, password: 'securePass123' },
        mockUser
        );

        expect(result.status).toBe(400);
        expect(result.success).toBe(false);
    });

    test('❌ Un Guest (3) NO puede crear usuarios', async () => {
        const guest = { id: 2, role_id: 3 }; // Guest
        const result = await createUser(
        { email: 'other@email.com', password: '123456' },
        guest
        );

        expect(result.status).toBe(403);
        expect(result.success).toBe(false);
    });

    // ---------------- OBTENER TODOS LOS USUARIOS ----------------
    test('✅ SuperAdmin (1) puede ver todos los usuarios', async () => {
        User.findAndCountAll.mockResolvedValue({
            rows: [mockUser],
            count: 1
        });
    
        const result = await getAllUsers(1, { page: 1, limit: 10 });
    
        expect(result.status).toBe(200);
        expect(result.body.users.length).toBeGreaterThan(0);
        expect(result.body.total).toBe(1);
    });
    
    test('✅ Admin (2) puede ver SubAdmins (2) y Guests (3)', async () => {
        User.findAndCountAll.mockResolvedValue({
            rows: [{ id: 2, role_id: 2 }, { id: 3, role_id: 3 }],
            count: 2
        });
    
        const result = await getAllUsers(2, { page: 1, limit: 10 });
    
        expect(result.status).toBe(200);
        expect(result.body.users.length).toBe(2);
        expect(result.body.total).toBe(2);
    });

    test('❌ Guest (3) NO puede ver otros usuarios', async () => {
        const result = await getAllUsers(3);

        expect(result.status).toBe(403);
        expect(result.success).toBe(false);
    });

    // ---------------- OBTENER USUARIO POR ID ----------------
    test('✅ SuperAdmin (1) puede ver cualquier usuario', async () => {
        User.findByPk.mockResolvedValue(mockUser);

        const result = await getUserById(mockUser.id, { id: 2, role_id: 1 });

        expect(result.status).toBe(200);
    });

    test('✅ Admin (2) puede ver SubAdmins (2) y Guests (3)', async () => {
        const admin = { id: 3, role_id: 2 };
        const subAdmin = { id: 4, role_id: 3 };

        User.findByPk.mockResolvedValue(subAdmin);
        const result = await getUserById(4, admin);

        expect(result.status).toBe(200);
    });

    test('❌ Guest (3) NO puede ver otros usuarios', async () => {
        const guest = { id: 5, role_id: 3 };

        const result = await getUserById(3, guest);

        expect(result.status).toBe(403);
    });

    // ---------------- ACTUALIZAR USUARIO ----------------
    test('✅ Admin (2) puede actualizar un SubAdmin (3)', async () => {
        const admin = { id: 3, role_id: 2 };
        const subAdmin = { id: 4, role_id: 3, update: jest.fn() };

        User.findByPk.mockResolvedValue(subAdmin);

        const result = await updateUser(4, admin, { first_name: 'Updated' });

        expect(result.status).toBe(200);
    });

    test('❌ Guest (3) NO puede actualizar otros usuarios', async () => {
        const guest = { id: 5, role_id: 3 };

        const result = await updateUser(4, guest, { first_name: 'Hacker' });

        expect(result.status).toBe(403);
    });
});