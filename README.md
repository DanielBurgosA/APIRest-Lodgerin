# 🚀 API REST - Reto Técnico

## 📌 Descripción del Proyecto

### 🚀 API REST potente y segura  

Desarrollada con **Node.js**, **Express.js** y **PostgreSQL**, cumpliendo con todos los requerimientos del reto técnico y **más allá**.  

🔐 **Autenticación robusta con JWT**, reforzada con **Helmet** y **CORS** para máxima seguridad.  
📑 **Documentación clara y detallada con Swagger**, facilitando la integración.  
🧪 **Pruebas unitarias con Jest**, asegurando estabilidad y confiabilidad.  
⚡ **Arquitectura escalable basada en servicios**, con separación de responsabilidades para un **código modular, limpio y fácil de mantener**.  
💡 **Extras añadidos**: optimización de rendimiento, **mejoras de seguridad, manejo avanzado de errores, registro de sesiones activas para evitar robo de tokens, filtrados extra, rol de SuperAdministrador para un caso más real, envío de correos y más**.  

**Una API lista para escalar, segura y bien estructurada.** 🚀  


---

## 📖 Tabla de Contenidos

- [📌 Descripción del Proyecto](#descripcion-del-proyecto)
- [📦 Instalación y Configuración](#instalacion-y-configuracion)
- [⚙️ Uso de la API](#uso-de-la-api)
- [🔑 Autenticación y Roles](#autenticacion-y-roles)
- [📜 Documentación con Swagger](#documentacion-con-swagger)
- [🛠️ Extras Implementados](#extras-implementados)
- [🧪 Pruebas](#pruebas)
- [💡 Consideraciones Finales](#consideraciones-finales)

---


## 📦 Instalación y Configuración

### 1️⃣ **Clonar el repositorio**
bash
git clone https://github.com/tuusuario/repo-api.git
cd repo-api

### 2️⃣ Instalar dependencias

npm install

### 3️⃣ Configurar las variables de entorno

Crea un archivo .env basado en .env.example y configura los valores:

##### Port back
PORT=3001

####Modo Mantenimiento
MAINTENANCE_MODE='false'

####Credenciales DB (Formato del .env - Mail credentials se conectan a NodeMailer
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


### 4️⃣ Ejecutar migraciones y seeders
#### ⚙️ Opcional: Docker
```sh
docker-compose up -d
````` 

#### ⚙️ Local
```sh
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
`````

### 5️⃣ Iniciar el servidor
npm run dev

Para ejecutar pruebas:
npm test

El servidor estará disponible en http://localhost:3001.

### ⚙️ Uso de la API

### 🔑 Autenticación y Roles

La API implementa JWT (JSON Web Token) para la autenticación de usuarios. Los roles definidos son:
Guest (3) → Solo puede registrarse e iniciar sesión.
Admin (2) → Acceso completo a la API.
SuperAdmin (1) → Permisos avanzados de administración.

El token se genera en el login y debe incluirse en el Authorization header:

Authorization: Bearer <token>

### 📜 Documentación con Swagger

La documentación de la API está disponible en:
http://localhost:3001/api-docs

### 🛠️ Extras Implementados

- ✅ Código modular y limpio, con una arquitectura escalable basada en la separación de responsabilidades.
- ✅ Middleware de validación con Joi, asegurando la integridad y consistencia de los datos recibidos.
- ✅ Rutas protegidas con JWT, implementando un sistema de refresh tokens para renovación segura de sesión.
- ✅ Estandarización de respuestas a nivel global, garantizando una comunicación consistente en la API.
- ✅ Depuración avanzada, con una consola personalizada para facilitar la identificación y solución de errores.
- ✅ Manejo centralizado de errores, a través de un middleware dedicado para una mejor gestión de excepciones.
- ✅ Seguridad mejorada, utilizando Helmet, CORS, Data Sanitization y Rate Limiting para mitigar vulnerabilidades.
- ✅ Restablecimiento seguro de contraseñas, con envío de correos a través de Nodemailer.
- ✅ Control y registro de sesiones activas, evitando el robo y uso indebido de tokens de autenticación.
- ✅ Arquitectura basada en Servicios (Service Layer Architecture), optimizando la escalabilidad y mantenibilidad del código.
- ✅ Inicialización rápida y eficiente de la base de datos, mediante Sequelize CLI.


### 🧪 Pruebas
Para ejecutar las pruebas, usa el siguiente comando:
npm test

Las pruebas cubren:
✔ Autenticación
✔ CRUD de usuarios
✔ Creación y consulta de transacciones
✔ Middleware de autenticación

### 💡 Consideraciones Finales
Esta API ha sido diseñada con un enfoque modular, escalable y seguro.Si tienes alguna pregunta o sugerencia, no dudes en abrir un issue en el repositorio.

### 🚀 ¡Gracias por revisar este proyecto! 😃🔥🚀


