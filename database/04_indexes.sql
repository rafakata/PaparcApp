-- Contiene los índices mínimos necesarios para optimizar las consultas mas communes del sistema PaparCapp
-- Los indices se usan para realizar búsquedas mas rapidas en las tablas de base de datos (SELECT, JOIN, WHERE, ORDER BY) 
-- pero pueden ralentizar las operaciones de escritura (INSERT, UPDATE, DELETE) debido a la necesidad de mantener los índices actualizados.

-- Las columnas que son PK o tienen UNIQUE ya cuentan con índices implícitos, por tanto no sera necesario crearlos


-- BUSQUEDA DE RESERVA POR MATRICULA.
CREATE INDEX idx_search_reservation_by_license_plate ON reservation(license_plate);
-- usado mucho en la operativa diaria para localizar reservas de un vehiculo concreto

-- BUSQUEDA DE RESERVA POR FECHA DE ENTRADA.
CREATE INDEX idx_search_reservation_by_entry_date ON reservation(entry_date);
-- usado para gestionar las reservas que entran en un dia concreto

-- BUSQUEDA DE RESERVA POR FECHA DE SALIDA.
CREATE INDEX idx_search_reservation_by_exit_date ON reservation(exit_date);
-- usado para gestionar las reservas que salen en un dia concreto

-- BUSQUEDA DE VEHICULO POR ID DE CLIENTE.
CREATE INDEX idx_search_vehicle_by_customer_id ON vehicle(id_customer);
-- usado para listar los vehiculos de un cliente concreto

-- BUSQUEDA DE FOTOS DE EVIDENCIA POR ID DE RESERVA.
CREATE INDEX idx_search_photo_by_reservation_id ON photo_evidence(id_reservation);
-- usado para recuperar las fotos asociadas a una reserva concreta

-- BUSQUEDA DE NOTIFICACIONES POR ID DE RESERVA.
CREATE INDEX idx_search_notification_by_reservation_id ON notification(id_reservation);
-- usado para recuperar las notificaciones asociadas a una reserva concreta

-- BUSQUEDA DE RESERVAS POR FECHA DE ENTRADA Y ESTADO.
CREATE INDEX idx_search_reservation_by_entry_date_status ON reservation(entry_date, status);
-- usado para gestionar las reservas que entran en un dia concreto y su estado (pendiente, confirmada, en curso, etc)

-- BUSQUEDA DE RESERVAS POR FECHA DE SALIDA Y ESTADO.
CREATE INDEX idx_search_reservation_by_exit_date_status ON reservation(exit_date, status);
-- usado para gestionar las reservas que salen en un dia concreto y su estado (en curso, salida confirmada, finalizada, etc)