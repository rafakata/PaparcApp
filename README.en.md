<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
</p>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/🌐%20Leer%20en-Español-c0392b?style=for-the-badge" alt="Leer en Español" /></a>
  &nbsp;
  <a href="https://rafakata-paparcapp.mintlify.app/"><img src="https://img.shields.io/badge/📚%20Official-Documentation-FF6B35?style=for-the-badge&logo=gitbook&logoColor=white" alt="Official Documentation" /></a>
</p>

# 🅿️ PaparcApp — Airport Parking Management System

**PaparcApp** is a full-stack web application developed as a **Final Degree Project (TFG)** for the **Web Application Development (DAW)** vocational training programme. It enables comprehensive airport parking management: online bookings, an administration panel, dynamic price calculation, email notifications, and complete lifecycle management for each stay.

> **Production deployment:** [https://paparcapp-azby.onrender.com](https://paparcapp-azby.onrender.com)

### 👥 Development Team

| Member |
|--------|
| **Javier Cabrera Miranda** |
| **Rafael Medina Quelle** |
| **Hamza Satori** |

---

## 📋 Table of Contents

- [Official Documentation](#-official-documentation)
- [Key Features](#-key-features)
- [Application Architecture](#-application-architecture)
- [Technology Stack](#-technology-stack)
- [Database Architecture](#-database-architecture)
- [Project Structure](#-project-structure)
- [Detailed Functionality](#-detailed-functionality)
- [REST API](#-rest-api)
- [Dynamic Pricing System](#-dynamic-pricing-system)
- [Authentication & Security](#-authentication--security)
- [Email Notifications](#-email-notifications)
- [Testing](#-testing)
- [Local Installation & Configuration](#-local-installation--configuration)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [License](#-license)

---

## 📚 Official Documentation

The complete project documentation — usage guides, API reference, environment setup and more — is available on our official documentation page:

<p align="center">
  <a href="https://rafakata-paparcapp.mintlify.app/">
    <img src="https://img.shields.io/badge/📚%20Open%20Official%20Documentation-PaparcApp-FF6B35?style=for-the-badge&logo=gitbook&logoColor=white" alt="PaparcApp Official Documentation" />
  </a>
</p>

> 🔗 **[https://rafakata-paparcapp.mintlify.app/](https://rafakata-paparcapp.mintlify.app/)**

---

## ✨ Key Features

| Area | Functionality |
|------|---------------|
| **Public bookings** | Multi-step form with real-time price calculation |
| **Administration panel** | Dashboard with calendar, entry/exit management, history with filters and pagination |
| **Full lifecycle** | PENDING → IN PROGRESS → COMPLETED (with business validations at each transition) |
| **Dynamic pricing** | Day-range rates × vehicle coefficient + additional services |
| **Dual authentication** | Classic login (email/password with bcrypt) + Social login (Google/Facebook via Firebase) |
| **Dual access** | User mode (registered customer) and Worker mode (administrator) |
| **Vehicle management** | Virtual garage with N:M relationship between customers and vehicles |
| **Photographic evidence** | Mandatory photo system (minimum 5) before starting a stay |
| **Subscription plans** | Quarterly, semi-annual and annual contracts |
| **Additional services** | Catalogue of extras (washes, MOT, EV charging, refuelling, maintenance) |
| **Notifications** | Automated emails via n8n (confirmation, check-in, modification, invoice) |
| **User profile** | Data management, vehicles, active bookings and history |
| **Responsive** | Adaptive design for mobile devices and desktop |

---

## 🏗️ Application Architecture

The application follows an **MVC (Model-View-Controller)** pattern with additional service layers:

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
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
│  13 tables · Constraints · Indexes · Initial data    │
└──────────────────────────────────────────────────────┘
```

### Request flow

1. The **client** sends an HTTP request
2. **Express** routes it to the corresponding router (`/`, `/users`, `/admin`, `/api`)
3. **Middlewares** validate session, permissions and prepare global variables
4. The **controller** processes the business logic
5. **DAOs** execute parameterised SQL queries against PostgreSQL
6. **Services** provide cross-cutting logic (pricing calculation, notifications)
7. The response is rendered with **EJS** (HTML) or returned as **JSON** (API)

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Server-side JavaScript runtime |
| **Express 4** | Web framework (routes, middleware, sessions) |
| **EJS** | Templating engine for server-side rendering |
| **pg (node-postgres)** | PostgreSQL driver with connection pool |
| **bcrypt** | Password hashing (10 salt rounds) |
| **express-session** | Session management with secure cookies |
| **dotenv** | Environment variable management |
| **morgan** | HTTP request logger |
| **axios** | HTTP client for n8n integration |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5 / CSS3** | Structure and custom styles |
| **JavaScript (ES6+)** | Client-side logic |
| **jQuery UI** | Calendar datepicker in the dashboard |
| **SweetAlert2** | Alerts, modals and interactive confirmations |
| **Firebase SDK** | Social authentication (Google / Facebook) |
| **Bootstrap Icons** | Iconography |

### Database
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Relational database |
| **Neon.tech** | Serverless PostgreSQL hosting in the cloud |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Render** | Node.js server hosting and deployment |
| **n8n** | Email flow automation (webhooks) |

---

## 🗄️ Database Architecture

The database consists of **13 tables** organised in three levels: master tables, operational tables and relationship tables.

### Entity-Relationship Diagram

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

### System Tables

| Table | Description | Key Relations |
|-------|-------------|---------------|
| `customer` | System users (ADMIN, REGISTERED, UNREGISTERED) | N:M with vehicle |
| `vehicle` | Registered vehicles with unique licence plate | FK to vehicle_coefficient |
| `customer_vehicle` | N:M relationship — virtual garage for each customer | Composite PK |
| `vehicle_coefficient` | Master table for vehicle types and price multipliers | SEDAN(×1), MOTORBIKE(×0.5), VAN(×1.25), CARAVAN(×2), SPECIAL(×1.5) |
| `main_service` | Main services: ECO, TRANSFER, MEET | Each with tagline and description |
| `service_rate` | Day-range rates for each service | FK to main_service |
| `additional_service` | Extra services (washes, MOT, EV charging, refuelling...) | Categories: CLEANING, MANAGEMENT, MAINTENANCE, ENERGY |
| `reservation` | Bookings with complete lifecycle | FK to customer, vehicle, main_service |
| `reservation_additional_service` | N:M relationship between bookings and additional services | Composite PK |
| `photo_evidence` | Evidence photos of vehicle condition | FK to reservation (CASCADE) |
| `notification` | Record of communications sent | FK to reservation (CASCADE) |
| `contract_plan` | Subscription plans (Quarterly, Semi-annual, Annual) | — |
| `contract` | Active customer subscriptions | FK to customer, vehicle, contract_plan |

### Business Constraints

The database implements **business rules at schema level** via CHECK constraints:

- **Booking status**: only `PENDING`, `IN PROGRESS`, `COMPLETED`, `CANCELLED`
- **Payment method**: only `CARD`, `CASH` or `NULL`
- **Parking spot**: mandatory in `IN PROGRESS` and `COMPLETED` status
- **Mandatory payment**: a booking cannot be completed without being marked as paid
- **Temporal consistency**: `exit_date` must be later than `entry_date`
- **Non-negative price**: `total_price >= 0`
- **Email/phone validation**: basic format at database level
- **Positive multiplier**: `multiplier > 0` in vehicle coefficients
- **Unique ranges**: duplicate rates for the same service and start day are not allowed

### Performance Indexes

**9 additional indexes** have been created beyond the implicit PK/UNIQUE ones to optimise the most frequent queries: searches by vehicle, entry/exit dates, customer, status, photos and notifications.

---

## 📂 Project Structure

```
proyecto/
├── app.js                          # Entry point — Express configuration
├── package.json                    # Dependencies and scripts
├── .env                            # Environment variables (not versioned)
├── .env.example                    # Configuration template
│
├── bin/
│   └── www                         # HTTP server (port startup)
│
├── config/
│   └── database.js                 # PostgreSQL connection pool (Singleton)
│
├── controllers/
│   ├── adminController.js          # Administration panel logic
│   ├── apiController.js            # REST endpoints (pricing, public bookings)
│   ├── authController.js           # Authentication, registration, user profile
│   └── mainController.js           # Public pages (landing, services, pricing)
│
├── database/
│   ├── 01_tables.sql               # Creation of 13 tables
│   ├── 02_constraints.sql          # Foreign keys and CHECK constraints
│   ├── 03_indexes.sql              # Performance indexes
│   └── 04_initial_data.sql         # Test data (complete scenario)
│
├── middlewares/
│   └── auth.js                     # Guards: isLoggedIn, isAdmin, authLocals
│
├── models/
│   ├── customer-dao.js             # Customer CRUD
│   ├── pricing-dao.js              # Reading coefficients and rates
│   ├── reservation-dao.js          # Booking CRUD (with transactions)
│   ├── service-catalog-dao.js      # Service and plan catalogue
│   └── vehicle-dao.js              # Vehicle CRUD
│
├── public/
│   ├── images/                     # Static images
│   ├── javascripts/                # Client-side logic
│   │   ├── booking.js              # Booking form (admin)
│   │   ├── dashboard.js            # Dashboard calendar and tables
│   │   ├── dynamic-pricing.js      # Real-time price calculation
│   │   ├── firebase-auth.js        # Social login (Google/Facebook)
│   │   ├── firebase-config.js      # Firebase SDK configuration
│   │   ├── flash-alert.js          # Global alert system
│   │   ├── index.js                # Landing page (parallax, FAQ)
│   │   ├── login.js                # User/worker toggle
│   │   ├── profile.js              # User profile (modals, editing)
│   │   ├── public-booking.js       # Public multi-step booking funnel
│   │   └── reservation-details-alert.js  # Booking actions (admin)
│   └── stylesheets/                # Modular CSS per view
│
├── routes/
│   ├── index.js                    # Public routes (/, /service, /price...)
│   ├── users.js                    # User routes (/users/login, /profile...)
│   ├── admin.js                    # Admin routes (/admin/dashboard...)
│   └── api.js                      # REST API (/api/pricing, /api/reservations...)
│
├── services/
│   ├── pricingService.js           # Pricing engine with RAM cache
│   ├── notificationService.js      # n8n integration (webhooks)
│   └── templates/                  # Email HTML templates
│       ├── confirmacion.html       # Booking confirmation
│       ├── entrada.html            # Vehicle checked in
│       ├── modificacion.html       # Booking modified
│       ├── factura-final.html      # Final invoice / stay completed
│       └── templatefactura.html    # PDF invoice template
│
├── tests/
│   └── pricingService.test.js      # Unit tests for the pricing engine
│
└── views/
    ├── index.ejs                   # Landing page
    ├── service.ejs                 # Services page
    ├── price.ejs                   # Pricing page
    ├── privacy.ejs                 # Privacy policy
    ├── booking.ejs                 # Public booking (multi-step)
    ├── login.ejs                   # Login (user/worker)
    ├── register.ejs                # User registration
    ├── profile.ejs                 # User profile
    ├── dashboard.ejs               # Administration dashboard
    ├── dashboard_booking.ejs       # New booking (admin)
    ├── reservation-details.ejs     # Booking detail (admin)
    ├── history.ejs                 # Booking history (admin)
    ├── error.ejs                   # Error page
    └── partials/
        ├── nav.ejs                 # Public navigation
        ├── footer.ejs              # Public footer
        ├── nav_dashboard.ejs       # Admin navigation
        └── footer_dashboard.ejs    # Admin footer
```

---

## 🚀 Detailed Functionality

### 🌐 Public Area

#### Landing Page
- Hero section with call to action
- Entry/exit date selectors for quick booking initiation
- Presentation of main services (ECO, TRANSFER, MEET)
- FAQ section with interactive accordion
- Parallax animation with vehicle

#### Services Page
- Detailed description of each main service
- Features broken down point by point

#### Pricing Page
- Rate table by day ranges and service type
- Coefficients by vehicle type (Sedan, Motorbike, Van, Caravan, Special)
- Additional services catalogue with prices
- Subscription plans (Quarterly, Semi-annual, Annual)

#### Public Booking
- **Multi-step form** with validation at each stage:
  1. **Step 1**: Selection of entry and exit dates
  2. **Step 2**: Vehicle data (licence plate, brand, model, colour, type) and personal data (name, phone, email)
  3. **Step 3**: Selection of main service and additional services
  4. **Step 4**: Summary and confirmation with calculated price
- Real-time dynamic price calculation via the API
- For authenticated users: pre-loads the first registered vehicle

#### Privacy Policy
- Static page with legal information

---

### 👤 User Area (Registered)

#### Registration
- Form with name, email, password and confirmation
- Matching passwords validation
- Duplicate email detection
- Hashing with bcrypt (10 salt rounds)

#### Login
- **Dual access mode** via tabs:
  - **User**: for registered customers → redirects to profile
  - **Worker**: for administrators → redirects to dashboard
- **Social login**: Google and Facebook via Firebase Authentication
- Contextual success/error messages

#### User Profile
- **Personal data**: viewing and editing (name, email, phone)
- **Password change**: validation of current + new password
- **Virtual garage**: list of linked vehicles
- **Active bookings**: cards with status, dates, service, price and actions:
  - **Cancel**: only PENDING bookings (with confirmation)
  - **Edit**: PENDING and IN PROGRESS bookings (in IN PROGRESS the entry date is locked)
- **Booking history**: list of past bookings (COMPLETED, CANCELLED)

---

### 🔧 Administration Area

#### Dashboard
- **Interactive calendar** (jQuery UI Datepicker) to select dates
- **Dynamic tables** of entries and exits for the selected day
- **Statistical indicators**: total entries and exits
- Colour coding according to booking status
- Direct access to each booking's detail
- Button to create a new booking

#### Create New Booking (from Admin)
- Complete form with all fields
- **Real-time summary side panel**
- Dynamic price calculation with each change
- Full data validation
- Atomic creation (customer + vehicle + booking in a transaction)

#### Booking Detail
- **Complete information**: customer, vehicle, service, dates, spot, price
- **Inline editing**: modify dates, vehicle, services, parking spot
- **Price recalculation** on edit
- **Photo gallery**: photographic evidence viewing
- **Photo upload**: add new photos with URL and description
- **Notification history**: record of emails sent
- **Status actions** (context-sensitive buttons based on current status):
  - ✅ **Start stay** (PENDING → IN PROGRESS): requires minimum 5 photos + assigned spot
  - 💰 **Complete stay** (IN PROGRESS → COMPLETED): payment method selection
  - ❌ **Cancel booking** (only from PENDING)

#### Booking History
- **Paginated table** (15 bookings per page)
- **Combinable filters**:
  - Status (PENDING, IN PROGRESS, COMPLETED, CANCELLED)
  - Free text search (customer name or licence plate)
  - Date range (from/to)
- Direct link to each booking's detail

---

## 📡 REST API

### Public Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/pricing/dynamic` | Calculates the dynamic price of a booking | `{ entry_date, exit_date, vehicle_type, id_main_service, id_additional_services[] }` |
| `POST` | `/api/reservations/public-new` | Creates a booking from the public form | Full customer, vehicle and booking data |

### Protected Endpoints (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reservations?date=YYYY-MM-DD` | Gets entries/exits for a date with statistics |

### Example response — Price calculation

```json
{
  "success": true,
  "data": {
    "total_price": 52.00
  }
}
```

---

## 💰 Dynamic Pricing System

The pricing engine (`pricingService.js`) is a **Singleton with RAM cache** that initialises at application startup to avoid repeated database queries.

### Calculation Formula

```
Total Price = (daily rate × days × vehicle coefficient) + Σ extras price
```

### Calculation Logic

1. **Day calculation**: difference between exit and entry dates
2. **Grace period**: the first **2 hours** of excess over a full day are not billed as an additional day
3. **Rate selection**: the range corresponding to the number of days and chosen service is looked up
4. **Vehicle multiplier**: the coefficient is applied according to vehicle type (Sedan ×1.00, Motorbike ×0.50, Caravan ×2.00...)
5. **Additional services**: prices of selected extras are added
6. **Rounding**: final result to 2 decimal places

### Rates by Range (Price/day)

| Days | ECO | TRANSFER | MEET |
|------|-----|----------|------|
| 1–3 | €12.00 | €15.00 | €18.00 |
| 4–10 | €8.00 | €11.00 | €14.00 |
| 11–15 | €6.00 | €9.00 | €12.00 |
| 16+ | €5.00 | €8.00 | €11.00 |

### Vehicle Coefficients

| Type | Multiplier |
|------|-----------|
| Sedan | ×1.00 |
| Motorbike | ×0.50 |
| Van | ×1.25 |
| Caravan | ×2.00 |
| Special | ×1.50 |

---

## 🔐 Authentication & Security

### User Types

| Type | Access | Description |
|------|--------|-------------|
| `ADMIN` | Full dashboard | Complete booking and operational management |
| `REGISTERED` | Profile + bookings | Customer with account (classic or social login) |
| `UNREGISTERED` | Public booking only | Walk-in customer without needing an account |

### Security Mechanisms

- **Password hashing**: bcrypt with 10 salt rounds
- **Secure sessions**: `express-session` with 1-hour cookie, `secure` flag in production
- **Trust proxy**: enabled for compatibility with Render's load balancer (HTTPS)
- **Protection middlewares**:
  - `isLoggedIn`: protects authenticated user routes
  - `isAdmin`: protects all administration panel routes
  - `authLocalsMiddleware`: injects session data into all EJS views
- **Social login**: Firebase Authentication (Google and Facebook) with token verification
- **Parameterised queries**: all SQL queries use parameters (`$1, $2...`) to prevent SQL injection
- **Server-side validations**: price recalculation on the server to prevent client-side manipulation

---

## 📧 Email Notifications

The notification system integrates with **n8n** (automation platform) via HTTP webhooks. Automated emails are sent on the following events:

| Event | Template | Description |
|-------|----------|-------------|
| Booking created | `confirmacion.html` | Confirmation with booking details |
| Vehicle checked in | `entrada.html` | Check-in confirmed with location |
| Booking modified | `modificacion.html` | New dates and updated price |
| Stay completed | `factura-final.html` | Final invoice with thank you message |

Additionally, a **PDF invoice template** (`templatefactura.html`) is available with a breakdown of services, VAT and payment status.

All templates follow **PaparcApp's branding** (corporate colours, Zen Dots and Poppins typefaces).

---

## 🧪 Testing

The project includes unit tests written with **Jest** for the pricing engine:

```bash
npm test
```

### Implemented Test Cases

| # | Test | Expected Result |
|---|------|----------------|
| 1 | Same entry and exit date | Charges minimum 1 day |
| 2 | Multiple days with range change | Applies correct range rate |
| 3 | Vehicle multiplier (Caravan ×2) | Price doubled |
| 4 | Additional services | Extras summed to base price |
| 5 | Non-existent vehicle type | Throws controlled error |
| 6 | Grace period (exactly 2h) | Does NOT charge extra day |
| 7 | Grace period (2h + 1min) | DOES charge extra day |

---

## ⚙️ Local Installation & Configuration

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14 (local or Neon.tech)

### Installation steps

```bash
# 1. Clone the repository
git clone https://github.com/tu-usuario/PaparcApp.git
cd PaparcApp/proyecto

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# 4. Create the database and load the schema
# Run in order in your PostgreSQL client:
psql -d paparcapp_db -f database/01_tables.sql
psql -d paparcapp_db -f database/02_constraints.sql
psql -d paparcapp_db -f database/03_indexes.sql
psql -d paparcapp_db -f database/04_initial_data.sql

# 5. Start in development mode
npm run dev

# 6. Access the application
# http://localhost:3000
```

### Available scripts

| Script | Command | Description |
|--------|---------|-------------|
| Production | `npm start` | Starts the server with Node.js |
| Development | `npm run dev` | Starts with Nodemon (hot-reload) |
| Tests | `npm test` | Runs tests with Jest |

---

## 🔑 Environment Variables

Create a `.env` file in the root of `/proyecto` based on `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Session
SESSION_SECRET=your_secret_key_here

# Database (local connection)
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paparcapp_db

# Database (Neon.tech connection — production)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

> **Note:** In production, the connection pool uses `DATABASE_URL` with SSL enabled. Locally, the individual `DB_*` variables can be used.

---

## 🌍 Deployment

The application is deployed in production using the following cloud infrastructure:

| Service | Provider | Purpose |
|---------|----------|---------|
| **Web Server** | [Render](https://render.com) | Node.js/Express server hosting |
| **Database** | [Neon.tech](https://neon.tech) | Serverless PostgreSQL in the cloud |

### Production link

> 🔗 **[https://paparcapp-azby.onrender.com](https://paparcapp-azby.onrender.com)**

### Deployment architecture

```
   User                   Render                  Neon.tech
  ┌──────┐           ┌──────────────┐         ┌────────────────┐
  │  🌐  │──HTTPS──►│  Node.js /   │──SSL──► │  PostgreSQL    │
  │      │◄─────────│  Express App │◄────────│  (Serverless)  │
  └──────┘           └──────────────┘         └────────────────┘
                           │
                           │ HTTP (webhook)
                           ▼
                     ┌──────────────┐
                     │     n8n      │
                     │   (Emails)   │
                     └──────────────┘
```

### Render deployment configuration

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node.js
- **Environment variables**: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`, etc.
- **Trust Proxy**: enabled in Express for correct cookie management behind Render's proxy

### Deployment notes

- Connection to Neon.tech requires **SSL** (`rejectUnauthorized: false`)
- Session cookie has `secure: true` flag only in production (HTTPS)
- Render service may experience **cold start** on the free plan (first request may take ~30 seconds)
- The price cache initialises at startup; if it fails, the process stops with an error code

---

## 📄 License

This project was developed as a **Final Degree Project (TFG)** for the **Web Application Development (DAW)** vocational training programme.

**Commercial use reserved** — This software is the property of its authors and commercial use is exclusively reserved to them. Redistribution, modification for commercial purposes, or production use by third parties is not permitted without express authorisation.

**Open Source for improvements and testing** — Downloading, inspecting, modifying and using the code for educational, research, testing and contribution purposes is permitted. Contributions and pull requests are welcome.

---

<p align="center">
  Developed with ❤️ by <strong>Javier Cabrera Miranda</strong>, <strong>Rafael Medina Quelle</strong> and <strong>Hamza Satori</strong>
</p>
