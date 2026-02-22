-- ==========================================================
-- 05_INITIAL_DATA.SQL - ESCENARIO DE CARGA (REF: 22/02/2026)
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
    parking_spot,
    vehicle,
    vehicle_coefficient, 
    customer
RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------
-- 2. CONFIGURACIÓN MAESTRA DE PRECIOS (NUEVO)
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
(
  'ECO', 
  'Llega, entrega tus llaves y camina directo a tu vuelo.', 
  'Recepción de vehículo por nuestro personal|Aparcamiento profesional garantizado|Custodia de llaves en caja fuerte|Acceso a pie inmediato (2 min a terminal)|La opción más económica y rápida'
),
(
  'TRANSFER', 
  'Entrega tu coche y te llevamos a la terminal en minibus.', 
  'Aparcamiento realizado por trabajadores|Traslado VIP en minibus de cortesía|Ayuda completa con el equipaje|Recogida inmediata a tu regreso|Vigilancia 24h mientras viajas'
),
(
  'MEET', 
  'Servicio Premium: Recogida y entrega en la misma terminal.', 
  'Chófer profesional te espera en la terminal|Recogida de llaves y coche a pie de pista|Entrega de vehículo en la puerta de llegadas|Cero desplazamientos para el cliente|Ideal para viajes de negocios o máxima comodidad'
);

INSERT INTO service_rate (id_main_service, min_days, max_days, daily_price) VALUES
-- TARIFA ECO (ID 1)
(1, 1, 3, 12.00),
(1, 4, 10, 8.00),
(1, 11, 15, 6.00),
(1, 16, 9999, 5.00),

-- TARIFA TRANSFER (ID 2)
(2, 1, 3, 15.00),
(2, 4, 10, 11.00),
(2, 11, 15, 9.00),
(2, 16, 9999, 8.00),

-- TARIFA MEET (ID 3)
(3, 1, 3, 18.00),
(3, 4, 10, 14.00),
(3, 11, 15, 12.00),
(3, 16, 9999, 11.00);

-- 2.4 PLANES DE SUSCRIPCIÓN (CONTRACT_PLAN)
INSERT INTO contract_plan (name, duration_months, price, tagline, features) VALUES
(
  'Trimestral', 
  3, 
  325.00, 
  'La solución perfecta para tus viajes de temporada.', 
  'Servicios ECO y TRANSFER incluidos|Plaza prioritaria garantizada 100%|1 Lavado exterior de cortesía|Acceso ilimitado 24/7 sin reserva previa|Gestión de llaves profesional'
),
(
  'Semestral', 
  6, 
  590.00, 
  'Ahorra y viaja con total libertad durante medio año.', 
  'Servicios ECO y TRANSFER incluidos|Plaza prioritaria garantizada 100%|1 Lavado integral de cortesía|Prioridad en servicios adicionales|Sin compromiso de permanencia tras los 6 meses'
),
(
  'Anual', 
  12, 
  999.00, 
  'Máxima tranquilidad y ahorro para viajeros expertos.', 
  'Servicios ECO y TRANSFER incluidos|Plaza VIP fija y garantizada|2 Lavados integrales al año|Descuento del 10% en servicios extra|Facturación mensual o anual simplificada'
);

-- ----------------------------------------------------------
-- 3. SERVICIOS ADICIONALES
-- ----------------------------------------------------------
INSERT INTO additional_service (name, category, tagline, price, features) VALUES 
-- CATEGORÍA: LIMPIEZA
(
  'Lavado Básico', 'LIMPIEZA', 'Reluce por fuera.', 15.00, 
  'Lavado a mano exterior|Secado con microfibra|Limpieza de llantas y neumáticos'
),
(
  'Lavado Interior', 'LIMPIEZA', 'Higiene y frescura en el habitáculo.', 25.00, 
  'Aspirado profundo de alfombrillas|Limpieza técnica de salpicadero|Desinfección de conductos de aire'
),
(
  'Lavado Integral', 'LIMPIEZA', 'Tu coche, como si fuera nuevo.', 50.00, 
  'Limpieza de tapicería (asientos y suelo)|Lavado exterior premium|Eliminación de olores con ozono'
),
(
  'Detallado Pro', 'LIMPIEZA', 'El cuidado definitivo para entusiastas.', 100.00, 
  'Pulido de carrocería artesanal|Encerado de alta protección|Tratamiento de plásticos y gomas'
),

-- CATEGORÍA: GESTIÓN Y LOGÍSTICA
(
  'Repostaje', 'GESTIÓN', 'Sin paradas al salir del parking.', 15.00, 
  'Llenado del depósito antes de la entrega|Ahorro de tiempo al recoger|Combustible a precio de mercado (tique aparte)'
),
(
  'Pasar ITV', 'GESTIÓN', 'Nosotros nos encargamos de las colas.', 60.00, 
  'Revisión pre-ITV de puntos clave|Traslado a estación oficial|Trámite administrativo completo|Tasas ITV no incluidas'
),

-- CATEGORÍA: MANTENIMIENTO Y ENERGÍA
(
  'Mecánica Rápida', 'MANTENIMIENTO', 'Viaja con total seguridad.', 30.00, 
  'Revisión de niveles (aceite y refrigerante)|Presión de neumáticos|Comprobación del sistema de luces'
),
(
  'Carga EV', 'ENERGÍA', 'Batería al 100% al aterrizar.', 25.00, 
  'Carga eléctrica completa garantizada|Compatible con todos los modelos (Type 2/Tesla)|Sin colas en cargadores públicos'
);

-- ----------------------------------------------------------
-- 4. INFRAESTRUCTURA (70 PLAZAS: A-G)
-- ----------------------------------------------------------
INSERT INTO parking_spot (cod_parking_spot) VALUES 
('A-001'), ('A-002'), ('A-003'), ('A-004'), ('A-005'), ('A-006'), ('A-007'), ('A-008'), ('A-009'), ('A-010'),
('B-001'), ('B-002'), ('B-003'), ('B-004'), ('B-005'), ('B-006'), ('B-007'), ('B-008'), ('B-009'), ('B-010'),
('C-001'), ('C-002'), ('C-003'), ('C-004'), ('C-005'), ('C-006'), ('C-007'), ('C-008'), ('C-009'), ('C-010'),
('D-001'), ('D-002'), ('D-003'), ('D-004'), ('D-005'), ('D-006'), ('D-007'), ('D-008'), ('D-009'), ('D-010'),
('E-001'), ('E-002'), ('E-003'), ('E-004'), ('E-005'), ('E-006'), ('E-007'), ('E-008'), ('E-009'), ('E-010'),
('F-001'), ('F-002'), ('F-003'), ('F-004'), ('F-005'), ('F-006'), ('F-007'), ('F-008'), ('F-009'), ('F-010'),
('G-001'), ('G-002'), ('G-003'), ('G-004'), ('G-005'), ('G-006'), ('G-007'), ('G-008'), ('G-009'), ('G-010');

-- ----------------------------------------------------------
-- 5. USUARIOS (1 ADMIN + 10 CLIENTES)
-- ----------------------------------------------------------
INSERT INTO customer (full_name, email, phone, password_hash, type) VALUES 
-- ADMIN
('Administrador', 'paparcApp@email.com', '000000000', '$2b$10$pKA69x8WiMqNSSnnAqi/iuG4d/89vZZis2gU99CgNdmXpwJ6rz/Ru', 'ADMIN'),

-- REGISTRADOS (IDs 2-6)
('Carlos Sainz', 'carlos@email.com', '600111222', '$2b$10$/gAfw2tuZrE/M2S9eD9sNucFvHz7qlF6gbNErltvblCAMSXqqYZoO', 'REGISTRADO'),
('Marta Ortega', 'marta@email.com', '600333444', '$2b$10$6MQN7enCNv03yowuhDJQSOd8o/zyB98ds.M/B4KDMQfiSfyEoGdFe', 'REGISTRADO'),
('Eneko Atxa', 'eneko@email.com', '600555666', '$2b$10$wKmwE4xpTcbLpKfzVG2KzujMArxFkNBQobkupSFEBnsjif1rGAyiq', 'REGISTRADO'),
('Lucia Villalon', 'lucia@email.com', '600777888', '$2b$10$WgMH5jWpS4cfchdZ2LhyFemvIDfwe8m/nK5vVx6fBwwpg07rbEjtq', 'REGISTRADO'),
('David Bisbal', 'david@email.com', '600999000', '$2b$10$Apma3FSRRXF7c0xo09KHYubIUKgZS2e.gtjo/wyPiipcwLTcaODFq', 'REGISTRADO'),

-- NO REGISTRADOS (IDs 7-11)
('Juan Nadie', 'juan.guest@mail.com', '611111111', NULL, 'NO-REGISTRADO'),
('Pedro Pasajero', 'pedro.guest@mail.com', '622222222', NULL, 'NO-REGISTRADO'),
('Sofia Viajera', 'sofia.guest@mail.com', '633333333', NULL, 'NO-REGISTRADO'),
('Miguel Turista', 'miguel.guest@mail.com', '644444444', NULL, 'NO-REGISTRADO'),
('Laura Maleta', 'laura.guest@mail.com', '655555555', NULL, 'NO-REGISTRADO');

-- ----------------------------------------------------------
-- 6. VEHÍCULOS (15 TOTAL)
-- ----------------------------------------------------------
INSERT INTO vehicle (license_plate, brand, model, color, type, id_customer) VALUES 
('1111-AAA', 'Toyota', 'Prius', 'Blanco', 'TURISMO', 2), 
('2222-BBB', 'Ferrari', 'F40', 'Rojo', 'ESPECIAL', 2), 
('3333-CCC', 'Ford', 'Focus', 'Azul', 'TURISMO', 3), 
('4444-DDD', 'Tesla', 'Model Y', 'Blanco', 'TURISMO', 4), 
('5555-FFF', 'Vespa', 'Primavera', 'Amarillo', 'MOTOCICLETA', 4),
('6666-GGG', 'Mercedes', 'Viano', 'Negro', 'FURGONETA', 5), 
('7777-HHH', 'BMW', 'X5', 'Plata', 'TURISMO', 6), 
('8888-JJJ', 'Seat', 'Ibiza', 'Rojo', 'TURISMO', 7), 
('9999-KKK', 'Audi', 'Q7', 'Gris', 'TURISMO', 8), 
('1234-LLL', 'Volkswagen', 'California', 'Verde', 'CARAVANA', 8),
('5678-MMM', 'Porsche', 'Macan', 'Negro', 'TURISMO', 9), 
('9012-NNN', 'Renault', 'Clio', 'Blanco', 'TURISMO', 10), 
('3456-PPP', 'Peugeot', '208', 'Naranja', 'TURISMO', 11), 
('7890-RRR', 'Honda', 'Civic', 'Azul', 'TURISMO', 11), 
('1122-SSS', 'Land Rover', 'Defender', 'Verde', 'ESPECIAL', 5);

-- ----------------------------------------------------------
-- 7. CONTRATOS DE SUSCRIPCIÓN (NUEVO)
-- ----------------------------------------------------------
INSERT INTO contract (start_date, end_date, is_active, id_customer, license_plate, id_plan) VALUES
-- Carlos Sainz (Ferrari)
('2026-01-10 00:00:00', '2027-01-10 00:00:00', TRUE, 2, '2222-BBB', 3),

-- Lucia Villalon (Mercedes Viano)
('2026-01-24 00:00:00', '2026-04-24 00:00:00', TRUE, 5, '6666-GGG', 1);

-- ----------------------------------------------------------
-- 8. RESERVAS (FECHA REFERENCIA: 22/02/2026 - DOMINGO)
-- ----------------------------------------------------------

-- A. HISTÓRICO (Pasadas)

-- 1. FINALIZADA: (01 Feb - 06 Feb)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, license_plate, id_main_service, cod_parking_spot) 
VALUES ('2026-02-01 10:00:00', '2026-02-06 10:00:00', 'FINALIZADA', 50.00, TRUE, 'TARJETA', '1111-AAA', 1, 'A-001');

-- 2. FINALIZADA: (13 Feb - 17 Feb)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, license_plate, id_main_service, cod_parking_spot) 
VALUES ('2026-02-13 08:00:00', '2026-02-17 20:00:00', 'FINALIZADA', 45.00, TRUE, 'EFECTIVO', '3333-CCC', 2, 'A-002');

-- 3. CANCELADA: (17 Feb - 22 Feb) - Tenía que salir hoy pero canceló antes
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot) 
VALUES ('2026-02-17 12:00:00', '2026-02-22 12:00:00', 'CANCELADA', 0.00, FALSE, '8888-JJJ', 1, NULL);

-- B. MOVIMIENTOS DE "HOY" (22/02/2026)

-- 4. ENTRADA DE HOY (Ya ha llegado esta mañana -> EN CURSO)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot) 
VALUES ('2026-02-22 08:00:00', '2026-02-27 08:00:00', 'EN CURSO', 60.00, FALSE, '4444-DDD', 3, 'B-001');

-- 5. ENTRADA DE HOY (Pendiente de llegar esta noche -> ENTRADA CONFIRMADA)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot) 
VALUES ('2026-02-22 20:00:00', '2026-02-24 10:00:00', 'ENTRADA CONFIRMADA', 30.00, TRUE, '5555-FFF', 1, NULL);

-- 6. SALIDA DE HOY (Ya se ha ido esta mañana -> FINALIZADA)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, payment_method, license_plate, id_main_service, cod_parking_spot) 
VALUES ('2026-02-13 09:00:00', '2026-02-22 09:00:00', 'FINALIZADA', 120.00, TRUE, 'TARJETA', '6666-GGG', 2, 'C-001');

-- 7. SALIDA DE HOY (Pendiente de salir esta tarde -> EN CURSO)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot) 
VALUES ('2026-02-17 18:00:00', '2026-02-22 18:00:00', 'EN CURSO', 75.00, FALSE, '7777-HHH', 2, 'C-002');

-- C. LARGA ESTANCIA

-- 8. COCHE EN EL PARKING (Entró el 20, sale el 04/03)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot) 
VALUES ('2026-02-20 15:00:00', '2026-03-04 15:00:00', 'EN CURSO', 150.00, TRUE, '9999-KKK', 3, 'D-005');

-- 9. COCHE SIN FECHA DE SALIDA (Entró el 21)
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot, notes) 
VALUES ('2026-02-21 10:00:00', NULL, 'EN CURSO', 0.00, FALSE, '1122-SSS', 1, 'E-001', 'Pendiente de grúa');

-- D. FUTURO (Reservas para Marzo)

-- 10, 11, 12, 13, 14. Reservas Futuras 
INSERT INTO reservation (entry_date, exit_date, status, total_price, is_paid, license_plate, id_main_service, cod_parking_spot) 
VALUES 
('2026-03-09 09:00:00', '2026-03-13 09:00:00', 'ENTRADA CONFIRMADA', 55.00, TRUE, '1234-LLL', 2, NULL),
('2026-03-09 10:00:00', '2026-03-17 10:00:00', 'PENDIENTE', 80.00, FALSE, '5678-MMM', 1, NULL),
('2026-03-09 12:30:00', '2026-03-11 12:30:00', 'ENTRADA CONFIRMADA', 40.00, FALSE, '9012-NNN', 3, NULL),
('2026-03-10 08:00:00', '2026-03-14 08:00:00', 'PENDIENTE', 60.00, FALSE, '3456-PPP', 1, NULL),
('2026-03-12 15:00:00', '2026-03-22 15:00:00', 'ENTRADA CONFIRMADA', 120.00, TRUE, '7890-RRR', 2, NULL);

-- ----------------------------------------------------------
-- 9. SERVICIOS ADICIONALES
-- ----------------------------------------------------------
INSERT INTO reservation_additional_service (id_reservation, id_additional_service) VALUES 
(4, 8), -- Tesla (Carga EV)
(6, 3), -- Viano (Lavado Integral)
(7, 6), (7, 1), -- BMW (ITV + Lavado Básico)
(8, 4); -- Audi (Detallado)

-- ----------------------------------------------------------
-- 10. FOTOS DE EVIDENCIA
-- ----------------------------------------------------------
INSERT INTO photo_evidence (file_path, id_reservation) VALUES 
-- Res 1
('/uploads/1/1.jpg', 1), ('/uploads/1/2.jpg', 1), ('/uploads/1/3.jpg', 1), ('/uploads/1/4.jpg', 1), ('/uploads/1/5.jpg', 1),
-- Res 4
('/uploads/4/f1.jpg', 4), ('/uploads/4/f2.jpg', 4),
-- Res 6
('/uploads/6/1.jpg', 6), ('/uploads/6/2.jpg', 6), ('/uploads/6/3.jpg', 6), ('/uploads/6/4.jpg', 6), ('/uploads/6/5.jpg', 6), ('/uploads/6/6.jpg', 6),
-- Res 7
('/uploads/7/1.jpg', 7), ('/uploads/7/2.jpg', 7), ('/uploads/7/3.jpg', 7), ('/uploads/7/4.jpg', 7), ('/uploads/7/5.jpg', 7),
-- Res 8
('/uploads/8/1.jpg', 8), ('/uploads/8/2.jpg', 8), ('/uploads/8/3.jpg', 8), ('/uploads/8/4.jpg', 8), ('/uploads/8/5.jpg', 8), ('/uploads/8/6.jpg', 8), ('/uploads/8/7.jpg', 8), ('/uploads/8/8.jpg', 8);

-- ----------------------------------------------------------
-- 11. NOTIFICACIONES (FECHAS ACTUALIZADAS)
-- ----------------------------------------------------------

-- RESERVA 1 (FINALIZADA)
INSERT INTO notification (type, subject, message, sent_at, id_reservation) VALUES
('TICKET_RESERVA', 'Reserva Confirmada #1', 'Su reserva...', '2026-01-27 10:00:00', 1),
('RECORDATORIO_ENTRADA', 'Mañana le esperamos', 'Recuerde...', '2026-01-31 10:00:00', 1),
('ENTRADA_CONFIRMADA', 'Vehículo Recepcionado', 'Coche seguro...', '2026-02-01 10:15:00', 1),
('RECORDATORIO_SALIDA', 'Preparando su salida', 'Reserva finaliza...', '2026-02-05 10:00:00', 1),
('RECIBO_PAGO', 'Factura Simplificada', 'Adjuntamos recibo.', '2026-02-06 10:30:00', 1);

-- RESERVA 4 (EN CURSO - Entró HOY 22/02)
INSERT INTO notification (type, subject, message, sent_at, id_reservation) VALUES
('TICKET_RESERVA', 'Reserva Confirmada #4', 'Su reserva...', '2026-02-13 09:00:00', 4),
('RECORDATORIO_ENTRADA', 'Mañana le esperamos', 'Recuerde para hoy 22/02...', '2026-02-21 09:00:00', 4),
('ENTRADA_CONFIRMADA', 'Vehículo Recepcionado', 'Tesla seguro.', '2026-02-22 08:15:00', 4);

-- RESERVA 5 (ENTRADA CONFIRMADA - Entra hoy tarde 22/02)
INSERT INTO notification (type, subject, message, sent_at, id_reservation) VALUES
('TICKET_RESERVA', 'Reserva Confirmada #5', 'Su reserva...', '2026-02-13 10:00:00', 5),
('RECORDATORIO_ENTRADA', 'Mañana le esperamos', 'Recuerde para hoy 22/02 tarde...', '2026-02-21 20:00:00', 5);

-- RESERVA 6 (FINALIZADA - Salió hoy 22/02)
INSERT INTO notification (type, subject, message, sent_at, id_reservation) VALUES
('TICKET_RESERVA', 'Reserva Confirmada #6', 'Reserva registrada...', '2026-02-06 09:00:00', 6),
('ENTRADA_CONFIRMADA', 'Vehículo Recepcionado', 'Coche aparcado.', '2026-02-13 09:30:00', 6),
('RECORDATORIO_SALIDA', 'Su salida es hoy', 'Confirmar hora...', '2026-02-21 09:00:00', 6),
('RECIBO_PAGO', 'Pago Realizado', 'Adjunto recibo...', '2026-02-22 09:15:00', 6);