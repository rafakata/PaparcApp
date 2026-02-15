--Contiene la creacion de todas la tablas del proyecto PaparCapp

--LIMPIEZA PREVIA
-- El CASCADE es vital: borra la tabla y todas las FK que apunten a ella
DROP TABLE IF EXISTS reservation_additional_service CASCADE;
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS photo_evidence CASCADE;
DROP TABLE IF EXISTS contract CASCADE;          
DROP TABLE IF EXISTS contract_plan CASCADE;     
DROP TABLE IF EXISTS service_rate CASCADE;
DROP TABLE IF EXISTS reservation CASCADE;
DROP TABLE IF EXISTS additional_service CASCADE;
DROP TABLE IF EXISTS main_service CASCADE;
DROP TABLE IF EXISTS parking_spot CASCADE;
DROP TABLE IF EXISTS vehicle CASCADE;
DROP TABLE IF EXISTS vehicle_coefficient CASCADE;
DROP TABLE IF EXISTS customer CASCADE;

-- TABLA CUSTOMER: Clientes de la aplicación
CREATE TABLE customer (
    id_customer       SERIAL PRIMARY KEY,
    full_name         VARCHAR(100) NOT NULL,
    email             VARCHAR(150) NOT NULL UNIQUE,
    phone             VARCHAR(20),
    password_hash     VARCHAR(255),
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type              VARCHAR(30), 
    is_active         BOOLEAN NOT NULL DEFAULT TRUE
);


-- TABLA VEHICLE: Vehículos registrados
CREATE TABLE vehicle (
    license_plate     VARCHAR(15) PRIMARY KEY,
    brand             VARCHAR(50) NOT NULL,
    model             VARCHAR(50) NOT NULL,
    color             VARCHAR(30) NOT NULL, 
    type              VARCHAR(30) NOT NULL, 
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_customer       INT NOT NULL -- FK
);


-- TABLA PARKING_SPOT: Plazas de aparcamiento
CREATE TABLE parking_spot (
    cod_parking_spot  VARCHAR(20) PRIMARY KEY,
    is_available      BOOLEAN NOT NULL DEFAULT TRUE
);


-- TABLA MAIN_SERVICE: Servicios principales
CREATE TABLE main_service (
    id_main_service   SERIAL PRIMARY KEY,
    name              VARCHAR(100) NOT NULL UNIQUE, 
    description       VARCHAR(250),                 
    is_active         BOOLEAN NOT NULL DEFAULT TRUE
);


-- TABLA ADDITIONAL_SERVICE: Servicios adicionales
CREATE TABLE additional_service (
    id_additional_service SERIAL PRIMARY KEY,
    name                  VARCHAR(100) NOT NULL UNIQUE,
    price                 NUMERIC(8,2) NOT NULL,
    description           VARCHAR(250),                 
    is_active             BOOLEAN NOT NULL DEFAULT TRUE
);


-- TABLA RESERVATION: Reservas realizadas
CREATE TABLE reservation (
    id_reservation    SERIAL PRIMARY KEY,
    reservation_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    entry_date        TIMESTAMP NOT NULL,
    exit_date         TIMESTAMP,
    status            VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE', -- Simplificado
    total_price       NUMERIC(10,2) NOT NULL,
    is_paid          BOOLEAN NOT NULL DEFAULT FALSE,
    payment_method    VARCHAR(30),
    notes             TEXT,
    license_plate     VARCHAR(15) NOT NULL, -- FK
    id_main_service   INT NOT NULL, -- FK
    cod_parking_spot  VARCHAR(20)  -- FK
);


-- TABLA PHOTO_EVIDENCE: Evidencia visual de la entrada
CREATE TABLE photo_evidence (
    id_photo          SERIAL PRIMARY KEY,
    file_path         VARCHAR(255) NOT NULL,
    description       VARCHAR(200),
    taken_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_reservation    INT NOT NULL --FK
);


-- TABLA NOTIFICATION: Registro de comunicaciones
CREATE TABLE notification (
    id_notification   SERIAL PRIMARY KEY,
    subject           VARCHAR(150) NOT NULL, -- Simplificado
    message           TEXT NOT NULL,          -- Simplificado
    type              VARCHAR(50) NOT NULL,  -- Simplificado
    sent_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_reservation    INT NOT NULL --FK
);


-- TABLA INTERMEDIA: Relación Muchos a Muchos (Reservas <-> Servicios Adicionales)
CREATE TABLE reservation_additional_service (
    id_reservation        INT NOT NULL,
    id_additional_service INT NOT NULL,
    PRIMARY KEY (id_reservation, id_additional_service)
);

-- TABLA VEHICLE_COEFFICIENT: tabla maestra para tipos de vehículos y su multiplicador de precio según el tipo de vehículo
CREATE TABLE vehicle_coefficient (
    vehicle_type VARCHAR(30) PRIMARY KEY,
    multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00
);

-- TABLA SERVICE_RATE: tabla que controla los diferentes tipos de tarifas por tramos de días y servicios
CREATE TABLE service_rate (
    id_rate SERIAL PRIMARY KEY,
    min_days INT NOT NULL,
    max_days INT NOT NULL,
    daily_price NUMERIC(8,2) NOT NULL,
    id_main_service INT NOT NULL -- FK
);

-- TABLA CONTRACT_PLAN: tabla que controla los diferentes tipos de planes de contrato
CREATE TABLE contract_plan (
    id_plan SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    duration_months INT NOT NULL,
    price NUMERIC(8,2) NOT NULL,
    description VARCHAR(250)
);

-- TABLA CONTRACT: controla las subscripciones o contratos activos de los clientes
CREATE TABLE contract (
    id_contract SERIAL PRIMARY KEY,
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    id_customer INT NOT NULL, -- FK
    license_plate VARCHAR(15) NOT NULL, -- FK el contrato pertenece a un coche específico
    id_plan INT NOT NULL -- FK 
);