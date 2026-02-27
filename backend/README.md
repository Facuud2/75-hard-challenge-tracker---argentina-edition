# 75 Hard Challenge Tracker - API Backend

Este es el backend para la aplicación **75 Hard Challenge Tracker - Argentina Edition**. Está construido con Node.js, Express, TypeScript, y utiliza Drizzle ORM para interactuar con una base de datos PostgreSQL Serverless alojada en Neon.

## 🚀 Tecnologías Principales
*   **Runtime:** Node.js
*   **Framework:** Express.js (v5)
*   **Lenguaje:** TypeScript
*   **Base de Datos:** PostgreSQL (Neon Serverless)
*   **ORM:** Drizzle ORM
*   **Autenticación:** bcrypt (Hash de contraseñas)

## 📁 Estructura del Proyecto

```bash
backend/
├── src/
│   ├── db/
│   │   ├── index.ts      # Configuración de conexión con Neon/Drizzle
│   │   └── schema.ts     # Definición de tablas y relaciones (Usuarios, Planes, etc)
│   ├── routes/
│   │   └── auth.ts       # Rutas de autenticación (Registro, Verificación de Email)
│   └── index.ts          # Punto de entrada de la aplicación Express
├── .env                  # Variables de entorno (NO subido a Git)
├── drizzle.config.ts     # Configuración de Drizzle Kit
├── package.json          # Dependencias y scripts
└── tsconfig.json         # Configuración del compilador TypeScript
```

## 🛠️ Configuración y Ejecución Local

### 1. Requisitos Previos
*   Tener instalado Node.js (v18 o superior).
*   Tener una cuenta en [Neon](https://neon.tech/) para la base de datos PostgreSQL.

### 2. Instalación de Dependencias
Abre una terminal en la carpeta `backend/` y ejecuta:
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz de la carpeta `backend/` y configura tu cadena de conexión a la base de datos:
```env
DATABASE_URL=postgresql://usuario:contraseña@servidor.neon.tech/nombre_db?sslmode=require
PORT=3001
```

### 4. Configurar la Base de Datos (Migraciones)
Para crear las tablas en tu base de datos basada en el archivo `src/db/schema.ts`, ejecuta:
```bash
npm run db:push
```

### 5. Iniciar el Servidor de Desarrollo
Para arrancar el servidor con recarga automática (Nodemon + tsx), ejecuta:
```bash
npm run dev
```
El backend estará disponible en `http://localhost:3001` (o en el puerto definido en tu `.env`).

## 📡 Endpoints de la API (Rutas)

### Estado General
*   `GET /api/health`: Retorna un mensaje confirmando que el servidor está en funcionamiento.

### Autenticación (`/api/auth`)
*   `POST /api/auth/check-email`: Verifica si un correo electrónico ya existe en la base de datos. Usado en el frontend antes de avanzar en el proceso de Onboarding.
    *   **Body esperado:** `{ "email": "usuario@ejemplo.com" }`
*   `POST /api/auth/register`: Crea un nuevo usuario y su registro inicial de estadísticas físicas.
    *   **Body esperado:** `{ "name", "email", "password", "weight", "height", "avatarUrl?" }`

## 📦 Scripts Disponibles (`package.json`)
*   `npm run dev`: Inicia el servidor de desarrollo.
*   `npm run build`: Compila el código TypeScript a JavaScript en la carpeta `dist/`.
*   `npm start`: Ejecuta el código compilado (`node dist/index.js`).
*   `npm run db:push`: Sincroniza el esquema local de Drizzle directamente con la base de datos Neon.
*   `npm run db:generate`: Genera los archivos SQL de migración basados en los cambios del esquema.
