<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
</p>

# 🅿️ PaparcApp — Sistema de Gestión de Parking de Aeropuerto

**PaparcApp** es una aplicación web full-stack desarrollada como **Trabajo de Fin de Grado (TFG)** del ciclo formativo de **Desarrollo de Aplicaciones Web (DAW)** que permite la gestión integral de un parking de aeropuerto: reservas online, panel de administración, cálculo dinámico de precios, notificaciones por email y gestión completa del ciclo de vida de cada estancia.

> **Despliegue en producción:** [https://paparcapp-azby.onrender.com](https://paparcapp-azby.onrender.com)

### 👥 Equipo de Desarrollo

| Integrante |
|------------|
| **Javier Cabrera Miranda** |
| **Rafael Medina Quelle** |
| **Hamza Satori** |

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura de la Aplicación](#-arquitectura-de-la-aplicación)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura de Base de Datos](#-arquitectura-de-base-de-datos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Funcionalidades Detalladas](#-funcionalidades-detalladas)
- [API REST](#-api-rest)
- [Sistema de Precios Dinámico](#-sistema-de-precios-dinámico)
- [Autenticación y Seguridad](#-autenticación-y-seguridad)
- [Notificaciones por Email](#-notificaciones-por-email)
- [Testing](#-testing)
- [Instalación y Configuración Local](#-instalación-y-configuración-local)
- [Variables de Entorno](#-variables-de-entorno)
- [Despliegue](#-despliegue)
- [Licencia](#-licencia)

---

## ✨ Características Principales

| Área | Funcionalidad |
|------|---------------|
| **Reservas públicas** | Formulario multi-paso con cálculo de precio en tiempo real |
| **Panel de administración** | Dashboard con calendario, gestión de entradas/salidas, historial con filtros y paginación |
| **Ciclo de vida completo** | PENDIENTE → EN CURSO → FINALIZADA (con validaciones de negocio en cada transición) |
| **Precios dinámicos** | Tarifas por tramos de días × coeficiente de vehículo + servicios adicionales |
| **Doble autenticación** | Login clásico (email/contraseña con bcrypt) + Login social (Google/Facebook vía Firebase) |
| **Doble acceso** | Modo Usuario (cliente registrado) y modo Trabajador (administrador) |
| **Gestión de vehículos** | Garaje virtual con relación N:M entre clientes y vehículos |
| **Evidencia fotográfica** | Sistema de fotos obligatorio (mínimo 5) antes de iniciar una estancia |
| **Planes de suscripción** | Contratos trimestrales, semestrales y anuales |
| **Servicios adicionales** | Catálogo de extras (lavados, ITV, carga EV, repostaje, mantenimiento) |
| **Notificaciones** | Emails automatizados vía n8n (confirmación, entrada, modificación, factura) |
| **Perfil de usuario** | Gestión de datos, vehículos, reservas activas e historial |
| **Responsive** | Diseño adaptable a dispositivos móviles y escritorio |

---

## 🏗️ Arquitectura de la Aplicación

La aplicación sigue un patrón **MVC (Model-View-Controller)** con capas de servicio adicionales:

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                 │
│  EJS Templates · jQuery UI · SweetAlert2 · Firebase │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / HTTPS
┌───────────────────────▼─────────────────────────────┐
│                   EXPRESS.JS SERVER                  │
│                                                     │
│  ┌─────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │ Routes  │→ │ Middleware │→ │   Controllers    │  │
│  │         │  │ (auth,     │  │ (main, auth,     │  │
│  │ index   │  │  session,  │  │  admin, api)     │  │
│  │ users   │  │  locals)   │  │                  │  │
│  │ admin   │  │            │  │                  │  │
│  │ api     │  │            │  │                  │  │
│  └─────────┘  └────────────┘  └────────┬─────────┘  │
│                                        │             │
│  ┌──────────────────┐  ┌───────────────▼──────────┐  │
│  │    Services      │  │     Models (DAOs)        │  │
│  │ pricingService   │  │ customer-dao             │  │
│  │ notificationSvc  │  │ reservation-dao          │  │
│  │                  │  │ vehicle-dao              │  │
│  │                  │  │ pricing-dao              │  │
│  │                  │  │ service-catalog-dao      │  │
│  └──────────────────┘  └───────────────┬──────────┘  │
└────────────────────────────────────────┼─────────────┘
                                         │ SQL (pg Pool)
┌────────────────────────────────────────▼─────────────┐
│              PostgreSQL (Neon.tech)                   │
│  13 tablas · Constraints · Índices · Datos iniciales │
└──────────────────────────────────────────────────────┘
```

### Flujo de una petición

1. El **cliente** envía una petición HTTP
2. **Express** la enruta al router correspondiente (`/`, `/users`, `/admin`, `/api`)
3. Los **middlewares** validan sesión, permisos y preparan variables globales
4. El **controller** procesa la lógica de negocio
5. Los **DAOs** ejecutan consultas SQL parametrizadas contra PostgreSQL
6. Los **services** aportan lógica transversal (cálculo de precios, notificaciones)
7. La respuesta se renderiza con **EJS** (HTML) o se devuelve como **JSON** (API)

---

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Propósito |
|------------|-----------|
| **Node.js** | Entorno de ejecución JavaScript del lado del servidor |
| **Express 4** | Framework web (rutas, middleware, sesiones) |
| **EJS** | Motor de plantillas para renderizado del lado del servidor |
| **pg (node-postgres)** | Driver PostgreSQL con pool de conexiones |
| **bcrypt** | Hashing de contraseñas (10 salt rounds) |
| **express-session** | Gestión de sesiones con cookies seguras |
| **dotenv** | Gestión de variables de entorno |
| **morgan** | Logger HTTP de peticiones |
| **axios** | Cliente HTTP para integración con n8n |

### Frontend
| Tecnología | Propósito |
|------------|-----------|
| **HTML5 / CSS3** | Estructura y estilos personalizados |
| **JavaScript (ES6+)** | Lógica del lado del cliente |
| **jQuery UI** | Datepicker del calendario en el dashboard |
| **SweetAlert2** | Alertas, modales y confirmaciones interactivas |
| **Firebase SDK** | Autenticación social (Google / Facebook) |
| **Bootstrap Icons** | Iconografía |

### Base de Datos
| Tecnología | Propósito |
|------------|-----------|
| **PostgreSQL** | Base de datos relacional |
| **Neon.tech** | Hosting serverless de PostgreSQL en la nube |

### Infraestructura
| Tecnología | Propósito |
|------------|-----------|
| **Render** | Hosting y despliegue del servidor Node.js |
| **n8n** | Automatización de flujos de email (webhooks) |

---

## 🗄️ Arquitectura de Base de Datos

La base de datos consta de **13 tablas** organizadas en tres niveles: tablas maestras, tablas operativas y tablas de relación.

### Diagrama Entidad-Relación

```
┌───────────────┐       N:M        ┌───────────────┐
│   CUSTOMER    │◄────────────────►│    VEHICLE    │
│───────────────│  customer_vehicle │───────────────│
│ id_customer   │                  │ id_vehicle    │
│ full_name     │                  │ license_plate │
│ email (UQ)    │                  │ brand         │
│ phone (UQ)    │                  │ model         │
│ password_hash │                  │ color         │
│ type          │                  │ type ──────────┼──► VEHICLE_COEFFICIENT
│ is_active     │                  │               │    (vehicle_type, multiplier)
└───┬───────┬───┘                  └───────┬───────┘
    │       │                              │
    │       │    ┌─────────────────────┐    │
    │       └───►│    RESERVATION      │◄───┘
    │            │─────────────────────│
    │            │ id_reservation      │
    │            │ entry_date          │       N:M         ┌─────────────────────┐
    │            │ exit_date           │◄─────────────────►│ ADDITIONAL_SERVICE  │
    │            │ status              │ reservation_      │─────────────────────│
    │            │ total_price         │ additional_service│ name                │
    │            │ is_paid             │                   │ category            │
    │            │ payment_method      │                   │ price               │
    │            │ cod_parking_spot    │                   │ features            │
    │            │ id_main_service ────┼──► MAIN_SERVICE   └─────────────────────┘
    │            └──┬───────────┬─────┘    (name, tagline, description)
    │               │           │                │
    │               ▼           ▼                ▼
    │     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │     │PHOTO_EVIDENCE│ │ NOTIFICATION │ │ SERVICE_RATE │
    │     │──────────────│ │──────────────│ │──────────────│
    │     │ file_path    │ │ subject      │ │ min_days     │
    │     │ description  │ │ message      │ │ max_days     │
    │     │ taken_at     │ │ type         │ │ daily_price  │
    │     └──────────────┘ │ sent_at      │ └──────────────┘
    │                      └──────────────┘
    │
    │     ┌──────────────┐     ┌──────────────┐
    └────►│   CONTRACT   │────►│CONTRACT_PLAN │
          │──────────────│     │──────────────│
          │ start_date   │     │ name         │
          │ end_date     │     │ duration_mo  │
          │ is_active    │     │ price        │
          │ id_vehicle   │     │ features     │
          └──────────────┘     └──────────────┘
```

### Tablas del Sistema

| Tabla | Descripción | Relaciones Clave |
|-------|-------------|------------------|
| `customer` | Usuarios del sistema (ADMIN, REGISTRADO, NO-REGISTRADO) | N:M con vehicle |
| `vehicle` | Vehículos registrados con matrícula única | FK a vehicle_coefficient |
| `customer_vehicle` | Relación N:M — Garaje virtual de cada cliente | PK compuesta |
| `vehicle_coefficient` | Tabla maestra de tipos de vehículo y multiplicadores de precio | TURISMO(×1), MOTO(×0.5), FURGONETA(×1.25), CARAVANA(×2), ESPECIAL(×1.5) |
| `main_service` | Servicios principales: ECO, TRANSFER, MEET | Cada uno con tagline y descripción |
| `service_rate` | Tarifas por tramos de días para cada servicio | FK a main_service |
| `additional_service` | Servicios extra (lavados, ITV, carga EV, repostaje...) | Categorías: CLEANING, MANAGEMENT, MAINTENANCE, ENERGY |
| `reservation` | Reservas con ciclo de vida completo | FK a customer, vehicle, main_service |
| `reservation_additional_service` | Relación N:M entre reservas y servicios adicionales | PK compuesta |
| `photo_evidence` | Fotos de evidencia del estado del vehículo | FK a reservation (CASCADE) |
| `notification` | Registro de comunicaciones enviadas | FK a reservation (CASCADE) |
| `contract_plan` | Planes de suscripción (Trimestral, Semestral, Anual) | — |
| `contract` | Suscripciones activas de clientes | FK a customer, vehicle, contract_plan |

### Constraints de Negocio

La base de datos implementa **reglas de negocio a nivel de esquema** mediante CHECK constraints:

- **Estado de reserva**: solo `PENDIENTE`, `EN CURSO`, `FINALIZADA`, `CANCELADA`
- **Método de pago**: solo `TARJETA`, `EFECTIVO` o `NULL`
- **Plaza de parking**: obligatoria en estado `EN CURSO` y `FINALIZADA`
- **Pago obligatorio**: una reserva no puede finalizarse sin estar marcada como pagada
- **Coherencia temporal**: `exit_date` debe ser posterior a `entry_date`
- **Precio no negativo**: `total_price >= 0`
- **Validación de email/teléfono**: formato básico a nivel de BD
- **Multiplicador positivo**: `multiplier > 0` en coeficientes de vehículo
- **Tramos únicos**: no se permiten tarifas duplicadas para el mismo servicio y día de inicio

### Índices de Rendimiento

Se han creado **9 índices** adicionales a los implícitos de PK/UNIQUE para optimizar las consultas más frecuentes: búsquedas por vehículo, fechas de entrada/salida, cliente, estado, fotos y notificaciones.

---

## 📂 Estructura del Proyecto

```
proyecto/
├── app.js                          # Punto de entrada — configuración de Express
├── package.json                    # Dependencias y scripts
├── .env                            # Variables de entorno (no versionado)
├── .env.example                    # Plantilla de configuración
│
├── bin/
│   └── www                         # Servidor HTTP (arranque en puerto)
│
├── config/
│   └── database.js                 # Pool de conexiones PostgreSQL (Singleton)
│
├── controllers/
│   ├── adminController.js          # Lógica del panel de administración
│   ├── apiController.js            # Endpoints REST (precios, reservas públicas)
│   ├── authController.js           # Autenticación, registro, perfil de usuario
│   └── mainController.js           # Páginas públicas (landing, servicios, precios)
│
├── database/
│   ├── 01_tables.sql               # Creación de las 13 tablas
│   ├── 02_constraints.sql          # Foreign keys y CHECK constraints
│   ├── 03_indexes.sql              # Índices de rendimiento
│   └── 04_initial_data.sql         # Datos de prueba (escenario completo)
│
├── middlewares/
│   └── auth.js                     # Guards: isLoggedIn, isAdmin, authLocals
│
├── models/
│   ├── customer-dao.js             # CRUD de clientes
│   ├── pricing-dao.js              # Lectura de coeficientes y tarifas
│   ├── reservation-dao.js          # CRUD de reservas (con transacciones)
│   ├── service-catalog-dao.js      # Catálogo de servicios y planes
│   └── vehicle-dao.js              # CRUD de vehículos
│
├── public/
│   ├── images/                     # Imágenes estáticas
│   ├── javascripts/                # Lógica del lado del cliente
│   │   ├── booking.js              # Formulario de reserva (admin)
│   │   ├── dashboard.js            # Calendario y tablas del dashboard
│   │   ├── dynamic-pricing.js      # Cálculo de precio en tiempo real
│   │   ├── firebase-auth.js        # Login social (Google/Facebook)
│   │   ├── firebase-config.js      # Configuración de Firebase SDK
│   │   ├── flash-alert.js          # Sistema de alertas globales
│   │   ├── index.js                # Landing page (parallax, FAQ)
│   │   ├── login.js                # Toggle usuario/trabajador
│   │   ├── profile.js              # Perfil de usuario (modales, edición)
│   │   ├── public-booking.js       # Funnel de reserva pública multi-paso
│   │   └── reservation-details-alert.js  # Acciones sobre reservas (admin)
│   └── stylesheets/                # CSS modular por vista
│
├── routes/
│   ├── index.js                    # Rutas públicas (/, /service, /price...)
│   ├── users.js                    # Rutas de usuario (/users/login, /profile...)
│   ├── admin.js                    # Rutas de admin (/admin/dashboard...)
│   └── api.js                      # API REST (/api/pricing, /api/reservations...)
│
├── services/
│   ├── pricingService.js           # Motor de precios con caché en RAM
│   ├── notificationService.js      # Integración con n8n (webhooks)
│   └── templates/                  # Plantillas HTML de email
│       ├── confirmacion.html       # Confirmación de reserva
│       ├── entrada.html            # Vehículo recepcionado
│       ├── modificacion.html       # Reserva modificada
│       ├── factura-final.html      # Factura final / estancia completada
│       └── templatefactura.html    # Plantilla PDF de factura
│
├── tests/
│   └── pricingService.test.js      # Tests unitarios del motor de precios
│
└── views/
    ├── index.ejs                   # Landing page
    ├── service.ejs                 # Página de servicios
    ├── price.ejs                   # Página de tarifas
    ├── privacy.ejs                 # Política de privacidad
    ├── booking.ejs                 # Reserva pública (multi-step)
    ├── login.ejs                   # Login (usuario/trabajador)
    ├── register.ejs                # Registro de usuario
    ├── profile.ejs                 # Perfil de usuario
    ├── dashboard.ejs               # Dashboard administrativo
    ├── dashboard_booking.ejs       # Nueva reserva (admin)
    ├── reservation-details.ejs     # Detalle de reserva (admin)
    ├── history.ejs                 # Historial de reservas (admin)
    ├── error.ejs                   # Página de error
    └── partials/
        ├── nav.ejs                 # Navegación pública
        ├── footer.ejs              # Footer público
        ├── nav_dashboard.ejs       # Navegación del admin
        └── footer_dashboard.ejs    # Footer del admin
```

---

## 🚀 Funcionalidades Detalladas

### 🌐 Zona Pública

#### Landing Page
- Hero section con llamada a la acción
- Selectores de fecha de entrada/salida para inicio rápido de reserva
- Presentación de los servicios principales (ECO, TRANSFER, MEET)
- Sección de preguntas frecuentes (FAQ) con acordeón interactivo
- Animación parallax con vehículo

#### Página de Servicios
- Descripción detallada de cada servicio principal
- Características desglosadas punto por punto

#### Página de Precios
- Tabla de tarifas por tramos de días y tipo de servicio
- Coeficientes por tipo de vehículo (Turismo, Moto, Furgoneta, Caravana, Especial)
- Catálogo de servicios adicionales con precios
- Planes de suscripción (Trimestral, Semestral, Anual)

#### Reserva Pública (Booking)
- **Formulario multi-paso** con validación en cada etapa:
  1. **Paso 1**: Selección de fechas de entrada y salida
  2. **Paso 2**: Datos del vehículo (matrícula, marca, modelo, color, tipo) y datos personales (nombre, teléfono, email)
  3. **Paso 3**: Selección de servicio principal y servicios adicionales
  4. **Paso 4**: Resumen y confirmación con precio calculado
- Cálculo dinámico de precio en tiempo real mediante la API
- Para usuarios autenticados: precarga del primer vehículo registrado

#### Política de Privacidad
- Página estática con información legal

---

### 👤 Zona de Usuario (Registrado)

#### Registro
- Formulario con nombre, email, contraseña y confirmación
- Validación de contraseñas coincidentes
- Detección de email duplicado
- Hashing con bcrypt (10 salt rounds)

#### Login
- **Doble modo de acceso** mediante pestañas:
  - **Usuario**: para clientes registrados → redirige a perfil
  - **Trabajador**: para administradores → redirige al dashboard
- **Login social**: Google y Facebook mediante Firebase Authentication
- Mensajes de éxito/error contextuales

#### Perfil de Usuario
- **Datos personales**: visualización y edición (nombre, email, teléfono)
- **Cambio de contraseña**: validación de contraseña actual + nueva
- **Garaje virtual**: listado de vehículos vinculados
- **Reservas activas**: tarjetas con estado, fechas, servicio, precio y acciones:
  - **Cancelar**: solo reservas en estado PENDIENTE (con confirmación)
  - **Editar**: reservas PENDIENTE y EN CURSO (en EN CURSO la fecha de entrada queda bloqueada)
- **Historial de reservas**: listado de reservas pasadas (FINALIZADA, CANCELADA)

---

### 🔧 Zona de Administración

#### Dashboard
- **Calendario interactivo** (jQuery UI Datepicker) para seleccionar fechas
- **Tablas dinámicas** de entradas y salidas del día seleccionado
- **Indicadores estadísticos**: total de entradas y salidas
- Codificación por colores según estado de la reserva
- Acceso directo al detalle de cada reserva
- Botón para crear nueva reserva

#### Crear Nueva Reserva (desde Admin)
- Formulario completo con todos los campos
- **Panel lateral de resumen** en tiempo real
- Cálculo dinámico de precio con cada cambio
- Validación completa de datos
- Creación atómica (cliente + vehículo + reserva en transacción)

#### Detalle de Reserva
- **Información completa**: datos del cliente, vehículo, servicio, fechas, plaza, precio
- **Edición en línea**: modificar fechas, vehículo, servicios, plaza de parking
- **Recálculo de precio** al editar
- **Galería de fotos**: visualización de evidencia fotográfica
- **Subida de fotos**: añadir nuevas fotos con URL y descripción
- **Historial de notificaciones**: registro de emails enviados
- **Acciones de estado** (botones contextuales según el estado actual):
  - ✅ **Iniciar estancia** (PENDIENTE → EN CURSO): requiere mínimo 5 fotos + plaza asignada
  - 💰 **Finalizar estancia** (EN CURSO → FINALIZADA): selección de método de pago
  - ❌ **Cancelar reserva** (solo desde PENDIENTE)

#### Historial de Reservas
- **Tabla paginada** (15 reservas por página)
- **Filtros combinables**:
  - Estado (PENDIENTE, EN CURSO, FINALIZADA, CANCELADA)
  - Búsqueda de texto libre (nombre del cliente o matrícula)
  - Rango de fechas (desde/hasta)
- Enlace directo al detalle de cada reserva

---

## 📡 API REST

### Endpoints Públicos

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| `POST` | `/api/pricing/dynamic` | Calcula el precio dinámico de una reserva | `{ entry_date, exit_date, vehicle_type, id_main_service, id_additional_services[] }` |
| `POST` | `/api/reservations/public-new` | Crea una reserva desde el formulario público | Datos completos del cliente, vehículo y reserva |

### Endpoints Protegidos (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/reservations?date=YYYY-MM-DD` | Obtiene entradas/salidas de una fecha con estadísticas |

### Ejemplo de respuesta — Cálculo de precio

```json
{
  "success": true,
  "data": {
    "total_price": 52.00
  }
}
```

---

## 💰 Sistema de Precios Dinámico

El motor de precios (`pricingService.js`) es un **Singleton con caché en RAM** que se inicializa al arrancar la aplicación para evitar consultas repetidas a la base de datos.

### Fórmula de Cálculo

$$
\text{Precio Total} = (\text{tarifa\_diaria} \times \text{días} \times \text{coeficiente\_vehículo}) + \sum \text{precio\_extras}
$$

### Lógica de Cálculo

1. **Cálculo de días**: diferencia entre fechas de salida y entrada
2. **Periodo de cortesía**: las primeras **2 horas** de exceso sobre un día completo no se facturan como día adicional
3. **Selección de tarifa**: se busca el tramo correspondiente al número de días y servicio elegido
4. **Multiplicador de vehículo**: se aplica el coeficiente según el tipo (Turismo ×1.00, Moto ×0.50, Caravana ×2.00...)
5. **Servicios adicionales**: se suman los precios de los extras seleccionados
6. **Redondeo**: resultado final a 2 decimales

### Tarifas por Tramo (Precio/día)

| Días | ECO | TRANSFER | MEET |
|------|-----|----------|------|
| 1-3 | 12,00 € | 15,00 € | 18,00 € |
| 4-10 | 8,00 € | 11,00 € | 14,00 € |
| 11-15 | 6,00 € | 9,00 € | 12,00 € |
| 16+ | 5,00 € | 8,00 € | 11,00 € |

### Coeficientes de Vehículo

| Tipo | Multiplicador |
|------|---------------|
| Turismo | ×1.00 |
| Motocicleta | ×0.50 |
| Furgoneta | ×1.25 |
| Caravana | ×2.00 |
| Especial | ×1.50 |

---

## 🔐 Autenticación y Seguridad

### Tipos de Usuario

| Tipo | Acceso | Descripción |
|------|--------|-------------|
| `ADMIN` | Dashboard completo | Gestión total de reservas y operativa |
| `REGISTRADO` | Perfil + reservas | Cliente con cuenta (login clásico o social) |
| `NO-REGISTRADO` | Solo reserva pública | Cliente walk-in sin necesidad de cuenta |

### Mecanismos de Seguridad

- **Hashing de contraseñas**: bcrypt con 10 salt rounds
- **Sesiones seguras**: `express-session` con cookie de 1 hora, flag `secure` en producción
- **Trust proxy**: habilitado para compatibilidad con el balanceador de carga de Render (HTTPS)
- **Middlewares de protección**:
  - `isLoggedIn`: protege rutas de usuario autenticado
  - `isAdmin`: protege todas las rutas del panel de administración
  - `authLocalsMiddleware`: inyecta datos de sesión en todas las vistas EJS
- **Login social**: Firebase Authentication (Google y Facebook) con verificación de token
- **Consultas parametrizadas**: todas las queries SQL usan parámetros (`$1, $2...`) para prevenir inyección SQL
- **Validaciones server-side**: recálculo de precios en el servidor para evitar manipulación del cliente

---

## 📧 Notificaciones por Email

El sistema de notificaciones se integra con **n8n** (plataforma de automatización) mediante webhooks HTTP. Se envían emails automatizados en los siguientes eventos:

| Evento | Plantilla | Descripción |
|--------|-----------|-------------|
| Reserva creada | `confirmacion.html` | Confirmación con datos de la reserva |
| Vehículo recepcionado | `entrada.html` | Check-in confirmado con ubicación |
| Reserva modificada | `modificacion.html` | Nuevas fechas y precio actualizado |
| Estancia completada | `factura-final.html` | Factura final con agradecimiento |

Además, se dispone de una plantilla de **factura en formato PDF** (`templatefactura.html`) con desglose de servicios, IVA y estado de pago.

Todas las plantillas siguen el **branding de PaparcApp** (colores corporativos, tipografías Zen Dots y Poppins).

---

## 🧪 Testing

El proyecto incluye tests unitarios escritos con **Jest** para el motor de precios:

```bash
npm test
```

### Casos de Prueba Implementados

| # | Test | Resultado Esperado |
|---|------|--------------------|
| 1 | Mismo día de entrada y salida | Cobra mínimo 1 día |
| 2 | Varios días con cambio de tramo | Aplica tarifa correcta del tramo |
| 3 | Multiplicador de vehículo (Caravana ×2) | Precio duplicado |
| 4 | Servicios adicionales | Suma extras al precio base |
| 5 | Tipo de vehículo inexistente | Lanza error controlado |
| 6 | Periodo de cortesía (2h exactas) | NO cobra día extra |
| 7 | Periodo de cortesía (2h + 1min) | SÍ cobra día extra |

---

## ⚙️ Instalación y Configuración Local

### Prerrequisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14 (local o Neon.tech)

### Pasos de instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/PaparcApp.git
cd PaparcApp/proyecto

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (ver sección Variables de Entorno)

# 4. Crear la base de datos y cargar el esquema
# Ejecutar en orden en tu cliente PostgreSQL:
psql -d paparcapp_db -f database/01_tables.sql
psql -d paparcapp_db -f database/02_constraints.sql
psql -d paparcapp_db -f database/03_indexes.sql
psql -d paparcapp_db -f database/04_initial_data.sql

# 5. Iniciar en modo desarrollo
npm run dev

# 6. Acceder a la aplicación
# http://localhost:3000
```

### Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Producción | `npm start` | Inicia el servidor con Node.js |
| Desarrollo | `npm run dev` | Inicia con Nodemon (hot-reload) |
| Tests | `npm test` | Ejecuta los tests con Jest |

---

## 🔑 Variables de Entorno

Crear un archivo `.env` en la raíz de `/proyecto` basándose en `.env.example`:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Sesión
SESSION_SECRET=tu_clave_secreta_aqui

# Base de datos (conexión local)
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paparcapp_db

# Base de datos (conexión Neon.tech — producción)
DATABASE_URL=postgresql://usuario:password@host/database?sslmode=require
```

> **Nota:** En producción, el pool de conexiones usa `DATABASE_URL` con SSL habilitado. En local, se pueden usar las variables individuales `DB_*`.

---

## 🌍 Despliegue

La aplicación está desplegada en producción utilizando la siguiente infraestructura cloud:

| Servicio | Proveedor | Propósito |
|----------|-----------|-----------|
| **Servidor Web** | [Render](https://render.com) | Hosting del servidor Node.js/Express |
| **Base de Datos** | [Neon.tech](https://neon.tech) | PostgreSQL serverless en la nube |

### Enlace de producción

> 🔗 **[https://paparcapp-azby.onrender.com](https://paparcapp-azby.onrender.com)**

### Arquitectura de despliegue

```
   Usuario                Render                  Neon.tech
  ┌──────┐           ┌──────────────┐         ┌────────────────┐
  │  🌐  │──HTTPS──►│  Node.js /   │──SSL──► │  PostgreSQL    │
  │      │◄─────────│  Express App │◄────────│  (Serverless)  │
  └──────┘           └──────────────┘         └────────────────┘
                           │
                           │ HTTP (webhook)
                           ▼
                     ┌──────────────┐
                     │     n8n      │
                     │  (Emails)    │
                     └──────────────┘
```

### Configuración de despliegue en Render

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Entorno**: Node.js
- **Variables de entorno**: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`, etc.
- **Trust Proxy**: habilitado en Express para gestión correcta de cookies seguras detrás del proxy de Render

### Notas de despliegue

- La conexión a Neon.tech requiere **SSL** (`rejectUnauthorized: false`)
- La cookie de sesión tiene el flag `secure: true` solo en producción (HTTPS)
- El servicio de Render puede entrar en **cold start** en el plan gratuito (la primera petición puede tardar ~30 segundos)
- La caché de precios se inicializa al arrancar; si falla, el proceso se detiene con código de error

---

## 📄 Licencia

Este proyecto ha sido desarrollado como **Trabajo de Fin de Grado (TFG)** del ciclo formativo de **Desarrollo de Aplicaciones Web (DAW)**.

**Uso comercial reservado** — Este software es propiedad de sus autores y su uso comercial queda reservado exclusivamente a los mismos. No se permite la redistribución, modificación con fines comerciales ni el uso en producción por terceros sin autorización expresa.

**Open Source para mejoras y pruebas** — Se permite la descarga, inspección, modificación y uso del código con fines educativos, de investigación, pruebas y contribución de mejoras. Las contribuciones y pull requests son bienvenidas.

---

<p align="center">
  Desarrollado con ❤️ por <strong>Javier Cabrera Miranda</strong>, <strong>Rafael Medina Quelle</strong> y <strong>Hamza Satori</strong>
</p>
