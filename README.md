# 🚀 API REST - Reto Técnico

## 📌 Descripción del Proyecto

Esta API REST está desarrollada con **Node.js**, **Express.js** y **PostgreSQL**, cumpliendo con los requerimientos del reto técnico. Incluye autenticación con **JWT**, seguridad con **Helmet** y **CORS**, documentación con **Swagger**, y pruebas unitarias con **Jest/Mocha+Chai**. Además, se han agregado mejoras para optimización, seguridad y código limpio.

---

## 📖 Tabla de Contenidos

- [📌 Descripción del Proyecto](#-descripción-del-proyecto)
- [📦 Instalación y Configuración](#-instalación-y-configuración)
- [⚙️ Uso de la API](#️-uso-de-la-api)
- [🔑 Autenticación y Roles](#-autenticación-y-roles)
- [📜 Documentación con Swagger](#-documentación-con-swagger)
- [🛠️ Extras Implementados](#️-extras-implementados)
- [✅ Pruebas Unitarias](#-pruebas-unitarias)
- [💡 Consideraciones Finales](#-consideraciones-finales)

---


## 📦 Instalación y Configuración

### 1️⃣ **Clonar el repositorio**
bash
git clone https://github.com/tuusuario/repo-api.git
cd repo-api

### 2️⃣ Instalar dependencias

npm install

3️⃣ Configurar las variables de entorno

Crea un archivo .env basado en .env.example y configura los valores:

# Port back
PORT=3001

#Modo Mantenimiento
MAINTENANCE_MODE='false'

#Credenciales DB
DB_USER=TU_USER
DB_PASSWORD=TU_CLAVE
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="xxxxxxxxx"

#JWT_SECRETS
JWT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
JWT_REFRESH_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
JWT_RESET_PASSWORD_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

#MAIL CREDENTIALS
EMAIL_USER="xxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_PASS="xxxxxxxxxxxxxx"

#SALT ROUNDS
SALT_ROUNDS=10

# Producción
PROD_CORS_ORIGIN='*'

4️⃣ Ejecutar migraciones y seeders

Opcional: Docker

docker-compose up -d

Local:

npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

5️⃣ Iniciar el servidor

npm run dev

Para ejecutar pruebas:

npm test

El servidor estará disponible en http://localhost:3001.

⚙️ Uso de la API

🔑 Autenticación y Roles

La API implementa JWT (JSON Web Token) para la autenticación de usuarios. Los roles definidos son:

Guest (3) → Solo puede registrarse e iniciar sesión.

Admin (2) → Acceso completo a la API.

SuperAdmin (1) → Permisos avanzados de administración.

El token se genera en el login y debe incluirse en el Authorization header:

Authorization: Bearer <token>

📜 Documentación con Swagger

La documentación de la API está disponible en:

http://localhost:3001/api-docs

🛠️ Extras Implementados

✅ Código modular y limpio con separación de responsabilidades✅ Middleware de validación con Joi✅ Rutas protegidas con JWT✅ Manejo adecuado de errores con middleware centralizado✅ Uso de Helmet, CORS, Sanitize y Rate Limit para seguridad✅ Restablecimiento de contraseña con envío de correos con Nodemailer✅ Control y registro de sesiones con tablas extra para seguridad✅ Arquitectura basada en Servicios✅ Inicialización rápida con sequelize-cli

🧪 Pruebas

Para ejecutar las pruebas, usa el siguiente comando:

npm test

Las pruebas cubren:

✔ Autenticación✔ CRUD de usuarios✔ Creación y consulta de transacciones✔ Middleware de autenticación

💡 Consideraciones Finales

Esta API ha sido diseñada con un enfoque modular, escalable y seguro.Si tienes alguna pregunta o sugerencia, no dudes en abrir un issue en el repositorio.

🚀 ¡Gracias por revisar este proyecto! 😃🔥🚀


