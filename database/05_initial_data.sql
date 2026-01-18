-- Inserta datos iniciales para la pruebas del MVP y como archivo de pruebas de inserciones

-- ==========================================================
-- 05_INITIAL_DATA.SQL - ESCENARIO DE PRUEBA COMPLETO
-- ==========================================================

-- 1. LIMPIEZA PREVIA (Opcional, por si quieres ejecutarlo varias veces)
TRUNCATE TABLE customer, vehicle, reservation, parking_spot, main_service, additional_service CASCADE;

-- 2. CATÁLOGO DE SERVICIOS
INSERT INTO main_service (name, description) VALUES 
('Estancia Corta', 'Menos de 3 días'),
('Estancia Larga', 'Más de 3 días (Tarifa reducida)'),
('VIP Aeropuerto', 'Recogida en terminal y parking cubierto');

INSERT INTO additional_service (name, price, description) VALUES 
('Lavado Básico', 15.00, 'Lavado exterior a presión'),
('Lavado Integral', 45.00, 'Limpieza profunda interior y exterior'),
('Repostaje', 10.00, 'Gestión de llenado de depósito (combustible aparte)');

-- 3. INFRAESTRUCTURA (PLAZAS)
INSERT INTO parking_spot (cod_parking_spot) VALUES 
('A-01'), ('A-02'), ('A-03'), ('B-01'), ('B-02');

-- 4. CLIENTES Y VEHÍCULOS
INSERT INTO customer (full_name, email, phone, password_hash, type) VALUES 
('Carlos Sáez', 'carlos@email.com', '600111222', 'hash1', 'REGULAR'),
('Marta López', 'marta@email.com', '600333444', 'hash2', 'PREMIUM'),
('Empresa Renting', 'contacto@renting.com', '910000000', 'hash3', 'REGULAR');

INSERT INTO vehicle (license_plate, brand, model, color, type, id_customer) VALUES 
('1111AAA', 'Seat', 'Ibiza', 'Rojo', 'TURISMO', 1),
('2222BBB', 'Tesla', 'Model 3', 'Blanco', 'TURISMO', 2),
('3333CCC', 'BMW', 'X5', 'Negro', 'SUV', 3);

-- 5. RESERVAS CON "PICOS DE TRABAJO" (Mismo día, distintas horas)

-- CASO A: Mismo día de entrada (20 de enero), diferentes horas
-- Llegada temprana
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot)
VALUES ('2026-01-20 08:00:00', '2026-01-25 10:00:00', 'EN CURSO', 60.0, TRUE, '1111AAA', 1, 'A-01');

-- Llegada media mañana
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot)
VALUES ('2026-01-20 11:30:00', '2026-01-22 20:00:00', 'EN CURSO', 40.0, FALSE, '2222BBB', 1, 'A-02');

-- Llegada tarde (Aún no ha llegado, PENDIENTE)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot)
VALUES ('2026-01-20 18:00:00', '2026-01-23 18:00:00', 'PENDIENTE', 35.0, FALSE, '3333CCC', 2, NULL);


-- CASO B: Mismo día de salida (25 de enero), diferentes horas
-- Esta reserva entró hace días y sale el 25 a las 12:00
INSERT INTO vehicle (license_plate, brand, model, color, type, id_customer) VALUES ('4444DDD', 'Audi', 'A4', 'Gris', 'TURISMO', 2);
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot)
VALUES ('2026-01-15 10:00:00', '2026-01-25 12:00:00', 'EN CURSO', 120.0, TRUE, '4444DDD', 2, 'B-01');

-- Esta reserva sale el 25 a las 23:00 (Coche de Carlos Sáez)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot)
VALUES ('2026-01-24 09:00:00', '2026-01-25 23:00:00', 'EN CURSO', 30.0, TRUE, '1111AAA', 1, 'B-02');