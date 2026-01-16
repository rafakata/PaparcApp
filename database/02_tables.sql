--Contiene la creacion de todas la tablas del proyecto PaparCapp


-- TABLA CUSTOMER -- Clientes de la aplicacion
create table customer (
    id_customer serial primary key,
    full_name varchar(100) not null,
    mail varchar(150) not null unique,
    phone varchar(20),
    password_hash varchar(255) not null,
    registration_date timestamp not null default current_timestamp,
    customer_type varchar(30),
    is_active boolean not null default true
);


-- TABLA VEHICLE -- Vehiculos registrados en la aplicacion que ya han realizado alguna reserva
create table vehicle (
    license_plate varchar(15) primary key,
    brand varchar(50) not null,
    model varchar(50) not null,
    colour varchar(30),
    type_vehicle varchar(30) not null,
    registration_date timestamp not null default current_timestamp,
    id_customer int not null  --FK
);


-- TABLA RESERVATION -- Reservas realizadas por los clientes
create table reservation (
    id_reservation serial primary key,
    reservation_date timestamp not null default current_timestamp,
    entry_date timestamp not null,
    exit_date timestamp,
    status varchar(30) not null default 'PENDIENTE',
    total_price numeric(10,2) not null,
    payment_method varchar(30),
    notes text,
    license_plate varchar(15) not null, --FK
    id_main_service int not null, --FK
    cod_parking_spot varchar(20) not null --FK
);


-- TABLA MAIN_SERVICE -- Servicios principales de la aplicación
create table main_service (
    id_main_service serial primary key,
    name varchar(100) not null unique,
    description varchar(250),
    is_active boolean not null default true
);

-- TABLA ADDITIONAL_SERVICE -- servicios adicionales que se pueden agregar a una reserva
create table additional_service (
    id_additional_service serial primary key,
    name varchar(100) not null unique,
    price numeric(8,2) not null,
    description varchar(250),
    is_active boolean not null default true
);


-- TABLA PHOTO_EVIDENCE -- Fotos de evidencia de la entrada de vehículos
create table photo_evidence(
    id_photo serial primary key,
    file_path varchar(255) not null,
    description varchar(200),
    taken_at timestamp not null default current_timestamp,
    id_reservation int not null --FK
);


-- TABLA NOTIFICATION -- notificaciones enviadas a los clientes
create table notification(
    id_notification serial primary key,
    subject varchar(150) not null,
    message text not null,
    type varchar(50) not null,
    sent_at timestamp not null default current_timestamp,
    id_reservation int not null --FK
);


-- TABLA PARKING_SPOT -- Plazas de aparcamiento disponibles en el parking
create table parking_spot (
    cod_parking_spot varchar(20) primary key,
    is_available boolean not null default true
);


-- TABLA RESERVATION_ADDITIONAL_SERVICE -- Tabla intermedia para la relación muchos a muchos entre reservas y servicios adicionales
create table reservation_additional_service (
    id_reservation int not null, --FK
    id_additional_service int not null, --FK
    primary key (id_reservation, id_additional_service)
);