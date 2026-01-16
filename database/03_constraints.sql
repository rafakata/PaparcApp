--Contiene todas la realaciones adicionales que aplican restricciones a las tablas ya creadas
-- separo las restricciones en un archivo aparte para mejorar la legibilidad y el mantenimiento del código SQL


-- FK VEHICLE -> CUSTOMER
alter table vehicle
    add constraint fk_vehicle_customer
    foreign key (id_customer)
    references customer(id_customer)
    on delete restrict
    on update cascade;

-- FK RESERVATION -> VEHICLE
alter table reservation
    add constraint fk_reservation_vehicle
    foreign key (license_plate)
    references vehicle(license_plate)
    on delete restrict
    on update cascade;

-- FK RESERVATION -> MAIN_SERVICE
alter table reservation
    add constraint fk_reservation_main_service
    foreign key (id_main_service)
    references main_service(id_main_service)
    on delete restrict
    on update cascade;

-- FK RESERVATION -> PARKING_SPOT
alter table reservation
    add constraint fk_reservation_parking_spot
    foreign key (cod_parking_spot)
    references parking_spot(cod_parking_spot)
    on delete restrict
    on update cascade;

