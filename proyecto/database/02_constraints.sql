--Contiene todas la realaciones adicionales que aplican restricciones a las tablas ya creadas
-- separo las restricciones en un archivo aparte para mejorar la legibilidad y el mantenimiento del código SQL


---
--- DEFINICIÓN DE RESTRICCIONES (CONSTRAINTS) - PROYECTO PARKING
---

-- RELACIÓN: VEHICLE -> CUSTOMER
ALTER TABLE vehicle
    ADD CONSTRAINT fk_vehicle_customer
    FOREIGN KEY (id_customer)
    REFERENCES customer(id_customer)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- RELACIÓN: RESERVATION -> VEHICLE
ALTER TABLE reservation
    ADD CONSTRAINT fk_reservation_vehicle
    FOREIGN KEY (license_plate)
    REFERENCES vehicle(license_plate)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- RELACIÓN: RESERVATION -> MAIN_SERVICE
ALTER TABLE reservation
    ADD CONSTRAINT fk_reservation_main_service
    FOREIGN KEY (id_main_service)
    REFERENCES main_service(id_main_service)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- RELACIÓN: RESERVATION -> PARKING_SPOT
ALTER TABLE reservation
    ADD CONSTRAINT fk_reservation_parking_spot
    FOREIGN KEY (cod_parking_spot)
    REFERENCES parking_spot(cod_parking_spot)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- RELACIÓN: PHOTO_EVIDENCE -> RESERVATION
-- (Se usa CASCADE para que si se borra la reserva, desaparezcan sus fotos)
ALTER TABLE photo_evidence
    ADD CONSTRAINT fk_photo_reservation
    FOREIGN KEY (id_reservation)
    REFERENCES reservation(id_reservation)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- RELACIÓN: NOTIFICATION -> RESERVATION
ALTER TABLE notification
    ADD CONSTRAINT fk_notification_reservation
    FOREIGN KEY (id_reservation)
    REFERENCES reservation(id_reservation)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- RELACIÓN: RESERVATION_ADDITIONAL_SERVICE -> RESERVATION (Tabla Intermedia)
ALTER TABLE reservation_additional_service
    ADD CONSTRAINT fk_ras_reservation
    FOREIGN KEY (id_reservation)
    REFERENCES reservation(id_reservation)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- RELACIÓN: RESERVATION_ADDITIONAL_SERVICE -> ADDITIONAL_SERVICE (Tabla Intermedia)
ALTER TABLE reservation_additional_service
    ADD CONSTRAINT fk_ras_additional_service
    FOREIGN KEY (id_additional_service)
    REFERENCES additional_service(id_additional_service)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- RELACIÓN: VEHICLE -> VEHICLE_COEFFICIENT
ALTER TABLE vehicle
    ADD CONSTRAINT fk_vehicle_type
    FOREIGN KEY (type)
    REFERENCES vehicle_coefficient(vehicle_type)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- RELACION: SERVICE_RATE -> MAIN_SERVICE
ALTER TABLE service_rate
    ADD CONSTRAINT  fk_service_rate_main_service
    FOREIGN KEY (id_main_service)
    REFERENCES main_service(id_main_service)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- RELACION: CONTRACT -> CUSTOMER
ALTER TABLE contract
    ADD CONSTRAINT fk_contract_customer
    FOREIGN KEY (id_customer)
    REFERENCES customer(id_customer)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- RELACION CONTRACT -> VEHICLE
ALTER TABLE contract
    ADD CONSTRAINT fk_contract_vehicle
    FOREIGN KEY (license_plate)
    REFERENCES vehicle(license_plate)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- RELCACION CONTRACT -> CONTRACT_PLAN
ALTER TABLE contract
    ADD CONSTRAINT fk_contract_plan
    FOREIGN KEY (id_plan)
    REFERENCES contract_plan(id_plan)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- CONSTRAINTS ADICIONALES

-- TIPOS DE ROLES DE USUARIO : limita los tipos de usuario permitidos en nuestra logica
ALTER TABLE customer
    ADD CONSTRAINT chk_customer_type
    CHECK (type IN ('ADMIN', 'REGISTRADO', 'NO-REGISTRADO'));

-- ESTADO DE LA RESERVA: Limita los estados a los permitidos por la lógica de negocio
ALTER TABLE reservation
    ADD CONSTRAINT chk_reservation_status
    CHECK (status IN ('PENDIENTE', 'ENTRADA CONFIRMADA', 'EN CURSO', 'SALIDA CONFIRMADA', 'FINALIZADA', 'CANCELADA'));

-- MÉTODO DE PAGO: Solo permite valores específicos o nulo si aún no se ha pagado
ALTER TABLE reservation
    ADD CONSTRAINT chk_reservation_payment_method
    CHECK (payment_method IN ('TARJETA', 'EFECTIVO') OR payment_method IS NULL);

-- PRECIO TOTAL: Garantiza que no existan valores negativos en la facturación
ALTER TABLE reservation
    ADD CONSTRAINT chk_reservation_total_price
    CHECK (total_price >= 0);

-- FECHAS DE RESERVA: Valida la coherencia temporal de la estancia
ALTER TABLE reservation
    ADD CONSTRAINT chk_reservation_exit_date
    CHECK (exit_date IS NULL OR exit_date >= entry_date);

-- ASIGNACIÓN DE PLAZA: Controla la asignación de plaza según el estado de la reseva.
ALTER TABLE reservation
    ADD CONSTRAINT chk_spot_assigned
    CHECK (
        status IN ('PENDIENTE','ENTRADA CONFIRMADA', 'CANCELADA') AND cod_parking_spot IS NULL -- permite nul si se encuentra en estos estados
        OR
        status IN ('EN CURSO', 'SALIDA CONFIRMADA', 'FINALIZADA') AND cod_parking_spot IS NOT NULL -- no permite nul si se encuentra en estos estados
    );

-- OBLIGATORIEDAD DE PAGO: una reserva no puede finalizar sin estar marcada como pagada
ALTER TABLE reservation
    ADD CONSTRAINT chk_reservation_must_be_paid
    CHECK (
        (status = 'FINALIZADA' AND is_paid = TRUE)
        OR
        (status <> 'FINALIZADA')
    );

-- VALIDACION DE MAIL BASICO: Asegura que el formato del correo electrónico sea válido
ALTER TABLE customer
    ADD CONSTRAINT chk_customer_email_format
    CHECK (email LIKE '%_@__%.__%');

-- VALIDACION DE TELEFONO BASICO: Asegura que  tenga un minimo de dígitos si se proporciona
ALTER TABLE customer
    ADD CONSTRAINT chk_customer_phone_format
    CHECK (LENGTH(phone) >= 7 OR phone IS NULL);

-- VALIDACION DE PRECIO EN SERVICIOS ADICIONALES: Asegura que el precio sea positivo
ALTER TABLE additional_service
    ADD CONSTRAINT chk_additional_service_price
    CHECK (price >= 0);

-- Tipos de notificaciones: Limita los tipos de notificaciones a los permitidos por la lógica de negocio
ALTER TABLE notification
    ADD CONSTRAINT chk_notification_type
    CHECK (type IN ('TICKET_RESERVA', 'RECORDATORIO_ENTRADA', 'ENTRADA_CONFIRMADA', 'RECORDATORIO_SALIDA', 'RECIBO_PAGO', 'ACTUALIZACION_RESERVA'));

-- RESTRICCION PARA VEHICLE_COEFFICIENT: aseguramos que que el multiplicador sea siempre mayor que 0
ALTER TABLE vehicle_coefficient
    ADD CONSTRAINT chk_vehicle_coefficient_positive
    CHECK (multiplier > 0);

-- VALIDACION DE RANGO DE DIAS: asegura que los días sean positivos y el rango tenga sentido
ALTER TABLE service_rate
    ADD CONSTRAINT chk_rate_days_range
    CHECK (min_days > 0 AND max_days >= min_days);

-- VALIDACIÓN DE PRECIO BASE: asegura que el precio base sea positivo3
ALTER TABLE service_rate
    ADD CONSTRAINT chk_rate_positive_price
    CHECK (daily_price >= 0);

-- EVITAR DUPLICADOS DE TRAMOS: impide crear dos tarifas que empiecen el mismo dia para el mismo servicio
ALTER TABLE service_rate
    ADD CONSTRAINT unique_rate_days
    UNIQUE (id_main_service, min_days);

-- VALIDACION DE FECHA: la fecha debe posterior a la de inicio
ALTER TABLE contract
    ADD CONSTRAINT chk_contract_dates
    CHECK (end_date > start_date);

-- VALIDACIÓN DE PLANES DE CONTRATO: los meses y el precio deben ser positvos
ALTER TABLE contract_plan
    ADD CONSTRAINT chk_contract_plan_values
    CHECK (duration_months > 0 AND price > 0);