-- ==========================================================
-- 01_TABLES.SQL - DEFINICIÓN DE ESTRUCTURA (REF: 13/02/2026)
-- ==========================================================

-- 1. LIMPIEZA PREVIA (Ordenada para evitar errores de dependencias)
-- Usamos CASCADE para asegurar que se borre todo lo relacionado
DROP TABLE IF EXISTS reservation_additional_service CASCADE;
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS photo_evidence CASCADE;
DROP TABLE IF EXISTS contract CASCADE;          -- Nueva tabla
DROP TABLE IF EXISTS contract_plan CASCADE;     -- Nueva tabla
DROP TABLE IF EXISTS service_rate CASCADE;      -- Nueva tabla
DROP TABLE IF EXISTS reservation CASCADE;
DROP TABLE IF EXISTS additional_service CASCADE;
DROP TABLE IF EXISTS main_service CASCADE;
DROP TABLE IF EXISTS parking_spot CASCADE;
DROP TABLE IF EXISTS vehicle CASCADE;
DROP TABLE IF EXISTS vehicle_coefficient CASCADE; -- Nueva tabla maestra
DROP TABLE IF EXISTS customer CASCADE;

-- ==========================================================
-- 2. MÓDULO DE USUARIOS Y VEHÍCULOS
-- ==========================================================

-- TABLA CUSTOMER: Clientes de la aplicación
CREATE TABLE customer (
    id_customer       SERIAL PRIMARY KEY,
    full_name         VARCHAR(100) NOT NULL,
    email             VARCHAR(150) NOT NULL UNIQUE,
    phone             VARCHAR(20),
    password_hash     VARCHAR(255), -- Puede ser NULL para usuarios 'guest'
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type              VARCHAR(30) DEFAULT 'REGISTRADO', -- 'ADMIN', 'REGISTRADO', 'GUEST'
    is_active         BOOLEAN NOT NULL DEFAULT TRUE
);

-- TABLA VEHICLE_COEFFICIENT (NUEVA): Configuración de precios por tipo
-- Esta tabla debe crearse antes que 'vehicle' conceptualmente
CREATE TABLE vehicle_coefficient (
    vehicle_type VARCHAR(30) PRIMARY KEY, -- Ej: 'TURISMO', 'MOTOCICLETA'
    multiplier   NUMERIC(4,2) NOT NULL DEFAULT 1.00
);

-- TABLA VEHICLE: Inventario de vehículos
CREATE TABLE vehicle (
    license_plate     VARCHAR(15) PRIMARY KEY,
    brand             VARCHAR(50) NOT NULL,
    model             VARCHAR(50) NOT NULL,
    color             VARCHAR(30) NOT NULL,
    type              VARCHAR(30) NOT NULL, -- Ahora será FK a vehicle_coefficient (en constraints)
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_customer       INT NOT NULL          -- FK a customer (en constraints)
);

-- ==========================================================
-- 3. MÓDULO DE INFRAESTRUCTURA Y SERVICIOS
-- ==========================================================

-- TABLA PARKING_SPOT: Plazas físicas
CREATE TABLE parking_spot (
    cod_parking_spot VARCHAR(10) PRIMARY KEY, -- Ej: 'A-001'
    is_available     BOOLEAN NOT NULL DEFAULT TRUE,
    floor            INT DEFAULT 0, -- Opcional: Planta del parking
    type             VARCHAR(20) DEFAULT 'STANDARD' -- Opcional: 'STANDARD', 'XL', 'ELECTRICO'
);

-- TABLA MAIN_SERVICE: Catálogo de servicios principales
CREATE TABLE main_service (
    id_main_service SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE, -- Ej: 'ECO', 'TRANSFER'
    description     VARCHAR(255)
);

-- TABLA SERVICE_RATE (NUEVA): Tarifas dinámicas por tramos de días
CREATE TABLE service_rate (
    id_rate         SERIAL PRIMARY KEY,
    min_days        INT NOT NULL,
    max_days        INT NOT NULL,
    daily_price     NUMERIC(8,2) NOT NULL,
    id_main_service INT NOT NULL -- FK a main_service (en constraints)
);

-- TABLA ADDITIONAL_SERVICE: Catálogo de extras
CREATE TABLE additional_service (
    id_additional_service SERIAL PRIMARY KEY,
    name                  VARCHAR(100) NOT NULL,
    price                 NUMERIC(8,2) NOT NULL,
    description           VARCHAR(255)
);

-- ==========================================================
-- 4. MÓDULO TRANSACCIONAL (CORE)
-- ==========================================================

-- TABLA RESERVATION: Tabla central del sistema
CREATE TABLE reservation (
    id_reservation   SERIAL PRIMARY KEY,
    entry_date       TIMESTAMP NOT NULL,
    exit_date        TIMESTAMP, -- Puede ser NULL si no saben cuándo salen (aunque raro en reservas)
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'CONFIRMADA', 'EN CURSO', 'FINALIZADA', 'CANCELADA'
    total_price      NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_paid          BOOLEAN NOT NULL DEFAULT FALSE,
    payment_method   VARCHAR(50), -- 'TARJETA', 'EFECTIVO', 'APP'
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes            TEXT,
    
    -- Claves foráneas (definidas en constraints.sql)
    license_plate    VARCHAR(15) NOT NULL,
    id_main_service  INT NOT NULL,
    cod_parking_spot VARCHAR(10) -- Puede ser NULL al principio hasta que se asigne plaza
);

-- TABLA RESERVATION_ADDITIONAL_SERVICE: Tabla pivote N:M
CREATE TABLE reservation_additional_service (
    id_reservation        INT NOT NULL,
    id_additional_service INT NOT NULL,
    PRIMARY KEY (id_reservation, id_additional_service)
);

-- TABLA PHOTO_EVIDENCE: Fotos del estado del vehículo
CREATE TABLE photo_evidence (
    id_photo       SERIAL PRIMARY KEY,
    file_path      VARCHAR(255) NOT NULL,
    uploaded_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_reservation INT NOT NULL -- FK
);

-- TABLA NOTIFICATION: Historial de comunicaciones
CREATE TABLE notification (
    id_notification SERIAL PRIMARY KEY,
    type            VARCHAR(50) NOT NULL, -- 'TICKET', 'RECORDATORIO', 'FACTURA'
    subject         VARCHAR(150),
    message         TEXT,
    sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read         BOOLEAN DEFAULT FALSE,
    id_reservation  INT NOT NULL -- FK
);

-- ==========================================================
-- 5. MÓDULO DE CONTRATOS / SUSCRIPCIONES (NUEVO)
-- ==========================================================

-- TABLA CONTRACT_PLAN (NUEVA): Catálogo de planes
CREATE TABLE contract_plan (
    id_plan         SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE, -- Ej: 'Trimestral', 'Anual'
    duration_months INT NOT NULL,
    price           NUMERIC(8,2) NOT NULL,
    description     VARCHAR(200)
);

-- TABLA CONTRACT (NUEVA): Suscripciones activas
CREATE TABLE contract (
    id_contract     SERIAL PRIMARY KEY,
    start_date      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date        TIMESTAMP NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Claves foráneas (definidas en constraints.sql)
    id_customer     INT NOT NULL,
    license_plate   VARCHAR(15) NOT NULL,
    id_plan         INT NOT NULL
);