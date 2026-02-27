-- ==========================================================
-- 05_INITIAL_DATA.SQL - ESCENARIO DE CARGA (REF: 28/02/2026)
-- ==========================================================

-- 1. LIMPIEZA TOTAL Y REINICIO DE CONTADORES
TRUNCATE TABLE 
    reservation_additional_service,
    notification,
    photo_evidence,
    reservation,
    contract,       
    contract_plan,  
    service_rate,   
    additional_service,
    main_service,
    customer_vehicle, -- ¡AÑADIDO! La nueva tabla intermedia
    vehicle,
    vehicle_coefficient, 
    customer
RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------
-- 2. CONFIGURACIÓN MAESTRA DE PRECIOS
-- ----------------------------------------------------------

-- 2.1 COEFICIENTES DE VEHÍCULO
INSERT INTO vehicle_coefficient (vehicle_type, multiplier) VALUES 
('TURISMO', 1.00),
('MOTOCICLETA', 0.50),
('FURGONETA', 1.25),
('CARAVANA', 2.00),
('ESPECIAL', 1.50);

-- 2.2 CATÁLOGO DE SERVICIOS
INSERT INTO main_service (name, tagline, full_description) VALUES 
('ECO', 'Arrive, hand over your keys and walk straight to your flight.', 'Vehicle reception by our staff|Professional parking guaranteed|Key custody in a safe box|Immediate walking access (2 min to terminal)|The fastest and most economical option'),
('TRANSFER', 'Hand over your car and we take you to the terminal by minibus.', 'Parking performed by staff|VIP transfer in courtesy minibus|Full assistance with luggage|Immediate pick-up on your return|24h surveillance while you travel'),
('MEET', 'Premium Service: Pick-up and drop-off at the terminal.', 'Professional chauffeur awaits you at the terminal|Key and car pick-up at the gate|Vehicle delivery at the arrivals door|Zero walking for the client|Ideal for business trips or maximum comfort');

-- 2.3 TARIFAS POR TRAMOS
INSERT INTO service_rate (id_main_service, min_days, max_days, daily_price) VALUES
(1, 1, 3, 12.00), (1, 4, 10, 8.00), (1, 11, 15, 6.00), (1, 16, 9999, 5.00),
(2, 1, 3, 15.00), (2, 4, 10, 11.00), (2, 11, 15, 9.00), (2, 16, 9999, 8.00),
(3, 1, 3, 18.00), (3, 4, 10, 14.00), (3, 11, 15, 12.00), (3, 16, 9999, 11.00);

-- 2.4 PLANES DE SUSCRIPCIÓN
INSERT INTO contract_plan (name, duration_months, price, tagline, features) VALUES
('Quarterly', 3, 325.00, 'The perfect solution for your seasonal trips.', 'ECO and TRANSFER services included|100% guaranteed priority spot|1 complimentary exterior wash|Unlimited 24/7 access without prior booking|Professional key management'),
('Semiannual', 6, 590.00, 'Save and travel with total freedom for half a year.', 'ECO and TRANSFER services included|100% guaranteed priority spot|1 complimentary full wash|Priority for additional services|No commitment after 6 months'),
('Annual', 12, 999.00, 'Maximum peace of mind and savings for expert travelers.', 'ECO and TRANSFER services included|Fixed VIP spot guaranteed|2 full washes per year|10% discount on extra services|Simplified monthly or annual billing');

-- ----------------------------------------------------------
-- 3. SERVICIOS ADICIONALES
-- ----------------------------------------------------------
INSERT INTO additional_service (name, category, tagline, price, features) VALUES 
('Basic Wash', 'CLEANING', 'Shine on the outside.', 15.00, 'Hand exterior wash|Microfiber drying|Wheel and tire cleaning'),
('Interior Cleaning', 'CLEANING', 'Hygiene and freshness inside.', 25.00, 'Deep vacuuming of mats|Technical dashboard cleaning|Air duct disinfection'),
('Full Wash', 'CLEANING', 'Your car, as good as new.', 50.00, 'Upholstery cleaning (seats and floor)|Premium exterior wash|Odor removal with ozone'),
('Pro Detailing', 'CLEANING', 'The ultimate care for enthusiasts.', 100.00, 'Handcrafted body polishing|High-protection waxing|Plastic and rubber treatment'),
('Refueling', 'MANAGEMENT', 'No stops when leaving the parking.', 15.00, 'Tank filled before delivery|Time saving at pick-up|Fuel at market price (ticket separate)'),
('MOT Service', 'MANAGEMENT', 'We handle the queues for you.', 60.00, 'Pre-MOT key points check|Transfer to official station|Full administrative procedure|MOT fees not included'),
('Quick Maintenance', 'MAINTENANCE', 'Travel with total safety.', 30.00, 'Fluid levels check (oil and coolant)|Tire pressure|Lights system check'),
('EV Charging', 'ENERGY', '100% battery upon landing.', 25.00, 'Full electric charge guaranteed|Compatible with all models (Type 2/Tesla)|No queues at public chargers');

-- ----------------------------------------------------------
-- 5. USUARIOS (1 ADMIN + 10 CLIENTES)
-- ----------------------------------------------------------
INSERT INTO customer (full_name, email, phone, password_hash, type) VALUES 
('Administrador', 'paparcApp@email.com', '000000000', '$2b$10$pKA69x8WiMqNSSnnAqi/iuG4d/89vZZis2gU99CgNdmXpwJ6rz/Ru', 'ADMIN'),
('Carlos Sainz', 'carlos@email.com', '600111222', '$2b$10$/gAfw2tuZrE/M2S9eD9sNucFvHz7qlF6gbNErltvblCAMSXqqYZoO', 'REGISTRADO'),
('Marta Ortega', 'marta@email.com', '600333444', '$2b$10$6MQN7enCNv03yowuhDJQSOd8o/zyB98ds.M/B4KDMQfiSfyEoGdFe', 'REGISTRADO'),
('Eneko Atxa', 'eneko@email.com', '600555666', '$2b$10$wKmwE4xpTcbLpKfzVG2KzujMArxFkNBQobkupSFEBnsjif1rGAyiq', 'REGISTRADO'),
('Lucia Villalon', 'lucia@email.com', '600777888', '$2b$10$WgMH5jWpS4cfchdZ2LhyFemvIDfwe8m/nK5vVx6fBwwpg07rbEjtq', 'REGISTRADO'),
('David Bisbal', 'david@email.com', '600999000', '$2b$10$Apma3FSRRXF7c0xo09KHYubIUKgZS2e.gtjo/wyPiipcwLTcaODFq', 'REGISTRADO'),
('Juan Nadie', 'juan.guest@mail.com', '611111111', NULL, 'NO-REGISTRADO'),
('Pedro Pasajero', 'pedro.guest@mail.com', '622222222', NULL, 'NO-REGISTRADO'),
('Sofia Viajera', 'sofia.guest@mail.com', '633333333', NULL, 'NO-REGISTRADO'),
('Miguel Turista', 'miguel.guest@mail.com', '644444444', NULL, 'NO-REGISTRADO'),
('Laura Maleta', 'laura.guest@mail.com', '655555555', NULL, 'NO-REGISTRADO');

-- ----------------------------------------------------------
-- 6. VEHÍCULOS INDEPENDIENTES (Sin id_customer)
-- ----------------------------------------------------------
INSERT INTO vehicle (license_plate, brand, model, color, type) VALUES 
('1111-AAA', 'Toyota', 'Prius', 'Blanco', 'TURISMO'),      -- id 1
('2222-BBB', 'Ferrari', 'F40', 'Rojo', 'ESPECIAL'),       -- id 2
('3333-CCC', 'Ford', 'Focus', 'Azul', 'TURISMO'),         -- id 3
('4444-DDD', 'Tesla', 'Model Y', 'Blanco', 'TURISMO'),    -- id 4
('5555-FFF', 'Vespa', 'Primavera', 'Amarillo', 'MOTOCICLETA'), -- id 5
('6666-GGG', 'Mercedes', 'Viano', 'Negro', 'FURGONETA'),  -- id 6
('7777-HHH', 'BMW', 'X5', 'Plata', 'TURISMO'),            -- id 7
('8888-JJJ', 'Seat', 'Ibiza', 'Rojo', 'TURISMO'),         -- id 8
('9999-KKK', 'Audi', 'Q7', 'Gris', 'TURISMO'),            -- id 9
('1234-LLL', 'Volkswagen', 'California', 'Verde', 'CARAVANA'), -- id 10
('5678-MMM', 'Porsche', 'Macan', 'Negro', 'TURISMO'),     -- id 11
('9012-NNN', 'Renault', 'Clio', 'Blanco', 'TURISMO'),     -- id 12
('3456-PPP', 'Peugeot', '208', 'Naranja', 'TURISMO'),     -- id 13
('7890-RRR', 'Honda', 'Civic', 'Azul', 'TURISMO'),        -- id 14
('1122-SSS', 'Land Rover', 'Defender', 'Verde', 'ESPECIAL'); -- id 15

-- ----------------------------------------------------------
-- 6.5. GARAJE VIRTUAL (N:M entre customer y vehicle)
-- ----------------------------------------------------------
INSERT INTO customer_vehicle (id_customer, id_vehicle) VALUES 
(2, 1), (2, 2),        -- Carlos tiene 2 coches
(3, 3),                -- Marta tiene 1 coche
(4, 4), (4, 5),        -- Eneko tiene 1 coche y 1 moto
(5, 6), (5, 15),       -- Lucia tiene furgoneta y todoterreno
(6, 7),                -- David
(7, 8),                -- Juan
(8, 9), (8, 10),       -- Pedro tiene un Audi y la VW California
(9, 10),               -- ¡MIRA ESTO! Sofia también tiene registrada la VW California en su perfil (Pareja)
(10, 11), (10, 12),    -- Miguel
(11, 13), (11, 14);    -- Laura

-- ----------------------------------------------------------
-- 7. CONTRATOS DE SUSCRIPCIÓN (Ref usan id_vehicle)
-- ----------------------------------------------------------
INSERT INTO contract (start_date, end_date, is_active, id_customer, id_vehicle, id_plan) VALUES
('2026-01-15 00:00:00', '2027-01-15 00:00:00', TRUE, 2, 2, 3), -- Carlos, Ferrari F40
('2026-01-29 00:00:00', '2026-04-29 00:00:00', TRUE, 5, 6, 1); -- Lucia, Mercedes Viano

-- ----------------------------------------------------------
-- 8. RESERVAS (FECHA REFERENCIA: 28/02/2026 - SÁBADO)
-- ----------------------------------------------------------

-- 8.1 HISTÓRICO
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-02-06 10:00:00', '2026-02-11 10:00:00', 'FINALIZADA', 50.00, TRUE, 'TARJETA', 2, 1, 1, 'A-001'); -- Carlos (Toyota)

INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-02-19 08:00:00', '2026-02-23 20:00:00', 'FINALIZADA', 45.00, TRUE, 'EFECTIVO', 3, 3, 2, 'A-002'); -- Marta (Ford)

INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-02-23 12:00:00', '2026-02-28 12:00:00', 'CANCELADA', 0.00, FALSE, NULL, 7, 8, 1, NULL); -- Juan (Seat)

-- 8.2 MOVIMIENTOS DE HOY (28/02/2026)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-02-28 08:00:00', '2026-03-05 08:00:00', 'EN CURSO', 60.00, FALSE, NULL, 4, 4, 3, 'B-001'); -- Eneko (Tesla) - Entró hoy

INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-02-28 20:00:00', '2026-03-02 10:00:00', 'PENDIENTE', 30.00, TRUE, 'TARJETA', 4, 5, 1, NULL); -- Eneko (Vespa) - Entrará esta noche

INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-02-19 09:00:00', '2026-02-28 09:00:00', 'FINALIZADA', 120.00, TRUE, 'TARJETA', 5, 6, 2, 'C-001'); -- Lucia (Mercedes) - Salió hoy

INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-02-23 18:00:00', '2026-02-28 18:00:00', 'EN CURSO', 75.00, FALSE, NULL, 6, 7, 2, 'C-002'); -- David (BMW) - Sale esta tarde

-- 8.3 ESTANCIAS LARGAS Y FUTURO
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-02-26 15:00:00', '2026-03-10 15:00:00', 'EN CURSO', 150.00, TRUE, 'TARJETA', 8, 9, 3, 'D-005'); -- Pedro (Audi)

INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-02-27 10:00:00', NULL, 'EN CURSO', 0.00, FALSE, NULL, 5, 15, 1, 'E-001'); -- Lucia (Land Rover) sin fecha salida

INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-03-15 09:00:00', '2026-03-19 09:00:00', 'PENDIENTE', 55.00, TRUE, 'TARJETA', 9, 10, 2, NULL); -- ¡MIRA! Sofia viaja con la furgo compartida (VW)

INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, id_customer, id_vehicle, id_main_service, cod_parking_spot) 
VALUES ('2026-03-15 10:00:00', '2026-03-23 10:00:00', 'PENDIENTE', 80.00, FALSE, NULL, 10, 11, 1, NULL); -- Miguel (Porsche)

-- ----------------------------------------------------------
-- 9. SERVICIOS ADICIONALES
-- ----------------------------------------------------------
INSERT INTO reservation_additional_service (id_reservation, id_additional_service) VALUES 
(4, 8), (6, 3), (7, 6), (7, 1), (8, 4);

-- ----------------------------------------------------------
-- 10. FOTOS DE EVIDENCIA
-- ----------------------------------------------------------
-- ----------------------------------------------------------
-- 10. FOTOS DE EVIDENCIA (Mínimo 5 por coche recepcionado)
-- ----------------------------------------------------------
INSERT INTO photo_evidence (file_path, description, id_reservation) VALUES 
-- Reserva 1 (FINALIZADA)
('/uploads/1/front.jpg', 'Frontal', 1), ('/uploads/1/back.jpg', 'Trasera', 1), ('/uploads/1/left.jpg', 'Lateral Izquierdo', 1), ('/uploads/1/right.jpg', 'Lateral Derecho', 1), ('/uploads/1/dash.jpg', 'Salpicadero', 1),
-- Reserva 2 (FINALIZADA)
('/uploads/2/front.jpg', 'Frontal', 2), ('/uploads/2/back.jpg', 'Trasera', 2), ('/uploads/2/left.jpg', 'Lateral Izquierdo', 2), ('/uploads/2/right.jpg', 'Lateral Derecho', 2), ('/uploads/2/dash.jpg', 'Salpicadero', 2),
-- Reserva 4 (EN CURSO)
('/uploads/4/front.jpg', 'Frontal', 4), ('/uploads/4/back.jpg', 'Trasera', 4), ('/uploads/4/left.jpg', 'Lateral Izquierdo', 4), ('/uploads/4/right.jpg', 'Lateral Derecho', 4), ('/uploads/4/dash.jpg', 'Salpicadero', 4),
-- Reserva 6 (FINALIZADA)
('/uploads/6/front.jpg', 'Frontal', 6), ('/uploads/6/back.jpg', 'Trasera', 6), ('/uploads/6/left.jpg', 'Lateral Izquierdo', 6), ('/uploads/6/right.jpg', 'Lateral Derecho', 6), ('/uploads/6/dash.jpg', 'Salpicadero', 6),
-- Reserva 7 (EN CURSO)
('/uploads/7/front.jpg', 'Frontal', 7), ('/uploads/7/back.jpg', 'Trasera', 7), ('/uploads/7/left.jpg', 'Lateral Izquierdo', 7), ('/uploads/7/right.jpg', 'Lateral Derecho', 7), ('/uploads/7/dash.jpg', 'Salpicadero', 7),
-- Reserva 8 (EN CURSO)
('/uploads/8/front.jpg', 'Frontal', 8), ('/uploads/8/back.jpg', 'Trasera', 8), ('/uploads/8/left.jpg', 'Lateral Izquierdo', 8), ('/uploads/8/right.jpg', 'Lateral Derecho', 8), ('/uploads/8/dash.jpg', 'Salpicadero', 8),
-- Reserva 9 (EN CURSO)
('/uploads/9/front.jpg', 'Frontal', 9), ('/uploads/9/back.jpg', 'Trasera', 9), ('/uploads/9/left.jpg', 'Lateral Izquierdo', 9), ('/uploads/9/right.jpg', 'Lateral Derecho', 9), ('/uploads/9/dash.jpg', 'Salpicadero', 9);

-- ----------------------------------------------------------
-- 11. NOTIFICACIONES (Adaptadas a la nueva restricción de 4 tipos)
-- ----------------------------------------------------------
INSERT INTO notification (type, subject, message, sent_at, id_reservation) VALUES
-- Reserva 1 (FINALIZADA) - Completó todo el ciclo
('TICKET_RESERVA', 'Reserva Confirmada #1', 'Su reserva ha sido creada. Adjuntamos factura inicial en PDF.', '2026-02-01 10:00:00', 1),
('ENTRADA_CONFIRMADA', 'Vehículo Recepcionado', 'Su coche ya se encuentra en las instalaciones del parking.', '2026-02-06 10:15:00', 1),
('RECIBO_PAGO', 'Factura de Estancia', 'Adjuntamos su factura final tras la recogida de su vehículo.', '2026-02-11 10:05:00', 1),

-- Reserva 4 (EN CURSO) - Ha sido editada antes de entrar
('TICKET_RESERVA', 'Reserva Confirmada #4', 'Su reserva ha sido creada. Adjuntamos factura inicial en PDF.', '2026-02-19 09:00:00', 4),
('ACTUALIZACION_RESERVA', 'Cambios en su reserva', 'Se han modificado los extras de su reserva. Adjuntamos factura actualizada.', '2026-02-22 11:30:00', 4),
('ENTRADA_CONFIRMADA', 'Vehículo Recepcionado', 'Su Tesla Model Y ya está seguro con nosotros.', '2026-02-28 08:15:00', 4),

-- Reserva 5 (ENTRADA CONFIRMADA) - Aún no ha llegado físicamente al parking
('TICKET_RESERVA', 'Reserva Confirmada #5', 'Su reserva ha sido creada. Adjuntamos factura inicial en PDF.', '2026-02-25 10:00:00', 5),

-- Reserva 6 (FINALIZADA) - Salió hoy
('TICKET_RESERVA', 'Reserva Confirmada #6', 'Su reserva ha sido creada. Adjuntamos factura inicial en PDF.', '2026-02-10 10:00:00', 6),
('ENTRADA_CONFIRMADA', 'Vehículo Recepcionado', 'Su Mercedes está en buenas manos.', '2026-02-19 09:10:00', 6),
('RECIBO_PAGO', 'Pago Realizado con Éxito', 'Adjunto recibo de los servicios adicionales...', '2026-02-28 09:15:00', 6),

-- Reserva 11 (PENDIENTE) - Entra el mes que viene
('TICKET_RESERVA', 'Reserva Confirmada #11', 'Su reserva ha sido procesada. Adjuntamos factura inicial en PDF.', '2026-02-28 12:00:00', 11);