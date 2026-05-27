# Turnify — Sistema de Gestión de Turnos

Plataforma web completa para la gestión de turnos y reservas en negocios de servicios (peluquerías, clínicas, centros de estética, gimnasios, etc.). Permite a los administradores gestionar profesionales, servicios y agenda, mientras que los clientes pueden reservar turnos de forma autónoma desde una página pública sin necesidad de registrarse.

---

## Objetivo

El objetivo de Turnify es simplificar la operatoria de agendamiento para pequeños y medianos negocios de servicios. Centraliza en una sola herramienta:

- La gestión interna de turnos, clientes y profesionales
- El control de disponibilidad horaria por profesional
- La reserva pública online sin fricciones para el cliente final
- Reportes y estadísticas del negocio

---

## Stack tecnológico

### Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| React | 18.3 | Framework UI |
| Vite | 5.3 | Build tool / Dev server |
| React Router DOM | 6.24 | Enrutamiento SPA |
| TanStack React Query | 5.45 | Server state management |
| Axios | 1.7 | Cliente HTTP |
| React Big Calendar | 1.13 | Vista de agenda/calendario |
| Recharts | 2.12 | Gráficos en reportes |
| date-fns | 3.6 | Utilidades de fechas |

### Backend
| Tecnología | Versión | Rol |
|---|---|---|
| Node.js + Express | 4.19 | API REST |
| Prisma ORM | 5.14 | Acceso a base de datos |
| PostgreSQL | — | Base de datos relacional |
| JSON Web Tokens | 9.0 | Autenticación stateless |
| bcryptjs | 2.4 | Hashing de contraseñas |
| Zod | 3.23 | Validación de esquemas |
| Resend | — | Notificaciones por email (opcional) |

---

## Arquitectura

```
turnify/
├── client/                  # SPA React + Vite
│   └── src/
│       ├── components/      # Componentes reutilizables
│       │   ├── calendar/    # Vista de agenda
│       │   ├── turnos/      # Formularios y badges de turnos
│       │   ├── profesionales/
│       │   ├── servicios/
│       │   └── shared/      # Navbar, Sidebar, Modal, etc.
│       ├── context/         # AuthContext, NegocioContext
│       ├── hooks/           # useAuth, useTurnos, useClientes...
│       ├── pages/           # Login, Dashboard, Agenda, etc.
│       ├── services/        # Capa de llamadas HTTP (axios)
│       └── router/          # Configuración de rutas
│
└── server/                  # API Express + Prisma
    ├── prisma/
    │   └── schema.prisma    # Esquema de base de datos
    └── src/
        ├── config/          # DB client, variables de entorno
        ├── controllers/     # Handlers de rutas
        ├── services/        # Lógica de negocio
        ├── routes/          # Definición de endpoints
        ├── middlewares/     # Auth, roles, validación, errores
        ├── validators/      # Esquemas Zod
        └── utils/           # JWT, hashing, helpers de fecha
```

El backend sigue un patrón **Controller → Service → Prisma**: los controllers reciben la request y delegan la lógica a los services, que interactúan con la base de datos vía Prisma. El frontend usa React Query para cachear y sincronizar el estado del servidor, con hooks custom por entidad.

---

## Modelo de datos (principales entidades)

```
Negocio  ──< Usuario
         ──< Profesional ──< HorarioDisponible
         ──< Servicio
         ──< Cliente
         ──< Turno (relaciona Profesional + Servicio + Cliente)
```

**Estados de un turno:** `PENDIENTE → CONFIRMADO → COMPLETADO / CANCELADO / AUSENTE`

**Roles de usuario:** `SUPER_ADMIN`, `ADMIN`, `PROFESIONAL`

---

## Funcionalidades principales

### Panel de administración
- **Dashboard** — saludo personalizado, próximo turno con cuenta regresiva, estadísticas del día, timeline de agenda y link de reserva pública
- **Agenda** — vista de calendario con React Big Calendar, coloreada por estado
- **Turnos** — CRUD completo con detección automática de conflictos de horario
- **Profesionales** — gestión de staff con horarios disponibles por día
- **Servicios** — catálogo con duración y precio por servicio
- **Clientes** — base de datos de clientes
- **Reportes** — estadísticas y gráficos del negocio (solo ADMIN)
- **Configuración** — datos del negocio

### Reserva pública
Cada negocio tiene una URL única (`/reservar/:slug`) donde los clientes pueden:
1. Ver los servicios y profesionales disponibles
2. Consultar disponibilidad en tiempo real
3. Reservar un turno sin necesidad de cuenta

### Motor de disponibilidad
El cálculo de slots disponibles considera:
- Horarios de trabajo del profesional por día de la semana
- Duración del servicio seleccionado
- Turnos ya existentes (evita solapamientos)

---

## Instalación y ejecución local

### Requisitos
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd server
npm install

# Crear .env con las siguientes variables:
# DATABASE_URL="postgresql://user:password@localhost:5432/turnify"
# JWT_SECRET="tu_secreto"
# JWT_EXPIRES_IN="7d"
# PORT=3000
# CORS_ORIGIN="http://localhost:5173"
# NODE_ENV=development

npm run db:migrate    # Crear tablas en la base de datos
npm run dev           # Servidor en http://localhost:3000
```

### Frontend

```bash
cd client
npm install
npm run dev           # App en http://localhost:5173
```

### Scripts útiles del servidor

```bash
npm run db:studio     # Abrir Prisma Studio (GUI de la DB)
npm run db:push       # Sincronizar schema sin migraciones
npm run db:generate   # Regenerar cliente Prisma
```

---

## API — Endpoints principales

**Base:** `/api/v1`

### Públicos (sin autenticación)
```
GET  /publico/:slug                  # Datos del negocio
GET  /publico/:slug/servicios        # Servicios disponibles
GET  /publico/:slug/profesionales    # Profesionales
GET  /publico/:slug/disponibilidad   # Slots libres
POST /publico/:slug/reservar         # Crear turno
```

### Protegidos (requieren JWT)
```
POST /auth/login
GET  /auth/me

GET|POST         /turnos
GET|PATCH|DELETE /turnos/:id
GET              /turnos/disponibilidad

GET|POST         /profesionales
GET|POST         /servicios
GET|POST         /clientes
GET|POST         /horarios
GET|PATCH        /negocios/me
GET              /reportes
```

---

## Cómo se construyó

El proyecto fue construido de forma iterativa con las siguientes decisiones de diseño:

1. **Multi-tenancy simple**: cada negocio (`Negocio`) es una unidad aislada. Los usuarios y datos están siempre scoped al negocio del usuario autenticado.

2. **Auth stateless**: JWT almacenado en localStorage; cada request protegida pasa por el middleware `auth` que valida el token y adjunta el usuario a `req.user`.

3. **Validación en capas**: Zod valida los payloads en el servidor antes de llegar al controller. En el cliente, React Query gestiona loading/error states de forma declarativa.

4. **Cálculo de disponibilidad**: el service `disponibilidad.service.js` genera slots cada N minutos (duración del servicio), filtra los que caen fuera del horario del profesional y los que colisionan con turnos existentes.

5. **Página pública sin auth**: los endpoints `/publico/*` son completamente abiertos y solo exponen datos necesarios para la reserva, sin información sensible del negocio.

6. **CSS custom sin frameworks**: el styling usa CSS puro con custom properties, manteniendo el bundle mínimo y el control total sobre el diseño.

---

## Variables de entorno

### Server (`server/.env`)
| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL |
| `JWT_SECRET` | Clave secreta para firmar tokens |
| `JWT_EXPIRES_IN` | Expiración del token (ej: `7d`) |
| `PORT` | Puerto del servidor (default: 3000) |
| `CORS_ORIGIN` | Origen permitido del frontend |
| `RESEND_API_KEY` | API key de Resend para emails (opcional) |
| `NODE_ENV` | `development` o `production` |

### Client (`client/.env`)
| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (ej: `http://localhost:3000/api/v1`) |
| `VITE_APP_NAME` | Nombre de la app |
