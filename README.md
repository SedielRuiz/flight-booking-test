# Flight Booking System

Sistema de reserva de vuelos con selección de asientos en tiempo real, control de concurrencia y procesamiento de pagos.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 18 |
| Backend | NestJS 12 + TypeScript |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 15 |
| Caché / Locks | Redis 7 |
| Reverse Proxy | Nginx |
| Orquestación | Docker Compose |

## Prerrequisitos

- [Node.js](https://nodejs.org/) v22+
- [Docker](https://www.docker.com/) y Docker Compose
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

---

## Opción 1: Levantar todo con Docker (Recomendado)

Un solo comando levanta PostgreSQL, Redis, el backend, el frontend y Nginx como API Gateway. No requiere instalar nada adicional en tu máquina.

```bash
docker compose up --build
```

Una vez que todos los contenedores estén arriba:

| Servicio | URL |
|---|---|
| **Aplicación completa** | http://localhost:4200 |
| **Health Check (API)** | http://localhost:4200/api/health |

Para detener todos los servicios:

```bash
docker compose down
```

Para detener y eliminar los volúmenes de datos (reset completo de la DB):

```bash
docker compose down -v
```

---

## Opción 2: Levantar localmente (Desarrollo)

Esta opción permite hot-reload tanto en el backend como en el frontend. Requiere tener PostgreSQL y Redis corriendo en tu máquina (o levantarlos con Docker por separado).

### Paso 1: Levantar PostgreSQL y Redis

Puedes usar los contenedores del mismo `docker-compose.yml` sin levantar el backend ni el frontend:

```bash
docker compose up postgres redis
```

O si ya tienes PostgreSQL y Redis instalados localmente, asegúrate de que estén corriendo en los puertos por defecto (`5432` y `6379`).

### Paso 2: Configurar variables de entorno del Backend

Crea o edita el archivo `backend/.env`:

```env
DATABASE_URL="postgresql://admin:admin_password@localhost:5432/flight_booking?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Paso 3: Instalar dependencias e inicializar la base de datos

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### Paso 4: Levantar el Backend (NestJS)

```bash
cd backend
npm run start:dev
```

El backend queda escuchando en **http://localhost:3000**. Health check disponible en **http://localhost:3000/api/health**.

### Paso 5: Levantar el Frontend (Angular)

En otra terminal:

```bash
cd frontend
ng serve
```

El frontend queda escuchando en **http://localhost:4200** con hot-reload activado.

---

## 🔒 Autenticación API (Basic Auth)

Todas las rutas del API están protegidas mediante **Basic Authentication** (simulando seguridad PCI-DSS y protección de recursos).
El frontend ya inyecta estos headers automáticamente a través de un interceptor, por lo que la SPA funciona de forma transparente.

Si deseas probar los endpoints directamente desde **Postman**, **cURL** o el navegador, utiliza estas credenciales por defecto (configurables en el `.env`):

- **Usuario:** `davivienda`
- **Contraseña:** `flight_secret`

---

## Scripts Útiles

### Backend (`/backend`)

| Comando | Descripción |
|---|---|
| `npm run start:dev` | Levantar con hot-reload (watch mode) |
| `npm run start:prod` | Levantar en modo producción |
| `npm run build` | Compilar TypeScript a `/dist` |
| `npm run test` | Ejecutar tests unitarios (Vitest) |
| `npm run test:e2e` | Ejecutar tests end-to-end |
| `npm run lint` | Ejecutar linter (oxlint) |
| `npx prisma migrate dev` | Crear/aplicar migraciones |
| `npx prisma studio` | Abrir el explorador visual de la DB |

### Frontend (`/frontend`)

| Comando | Descripción |
|---|---|
| `ng serve` | Levantar con hot-reload (puerto 4200) |
| `ng build` | Compilar para producción |
| `ng test` | Ejecutar tests unitarios (Karma) |

---

## Estructura del Proyecto

```
flight-booking-test/
├── backend/                  # API REST (NestJS + Prisma)
│   ├── prisma/
│   │   └── schema.prisma     # Modelo de datos
│   ├── src/
│   │   ├── common/           # Filtros, guards, interceptores globales
│   │   ├── prisma/           # PrismaService y PrismaModule
│   │   ├── app.module.ts     # Módulo raíz
│   │   ├── app.controller.ts # Controlador raíz (/api/health)
│   │   ├── app.service.ts    # Servicio raíz (health checks)
│   │   └── main.ts           # Bootstrap de la app
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # SPA (Angular 18)
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── shared/                   # Enums, constantes e interfaces (Compartidos Frontend/Backend)
├── infrastructure/
│   └── nginx/
│       └── nginx.conf        # Configuración del API Gateway
├── docs/
│   ├── architecture.md       # Diseño y decisiones de arquitectura
│   └── ia.md                 # Documentación de uso de IA
├── docker-compose.yml        # Orquestador maestro
└── README.md
```

---

## Documentación

- [Arquitectura y Decisiones Técnicas](docs/architecture.md)
- [Uso de Inteligencia Artificial](docs/ia.md)
