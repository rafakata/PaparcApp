# 📂 Database - Parking Valet (PaparCapp)

Este directorio contiene los scripts SQL necesarios para la creación, configuración y puesta en marcha de la base de datos de la aplicación **PaparCapp**. La estructura se ha modularizado para separar la creación de objetos, las reglas de negocio y la optimización de rendimiento.

## 🏗️ Estructura de Scripts SQL

Los archivos deben ejecutarse en el orden numérico indicado para evitar errores de dependencias (Foreign Keys):

| Orden | Archivo | Función Principal |
| :--- | :--- | :--- |
| **01** | `01_tables.sql` | **Definición de tablas (DDL).** Crea las entidades (Customer, Vehicle, Reservation, etc.). |
| **02** | `02_constraints.sql` | **Integridad y Lógica:** Foreign Keys, Check Constraints (Reglas de negocio y validación de roles/datos). |
| **03** | `03_indexes.sql` | **Optimización:** Índices para búsquedas rápidas por matrícula, fechas y estados. |
| **04** | `04_initial_data.sql` | **Datos Semilla:** Carga de catálogo de servicios, plazas y usuarios de prueba (Admin, Worker, Regular) con contraseñas hasheadas. |

---

## 🚀 Guía de Instalación (pgAdmin 4)

1. **Preparación:** Asegúrese de haber creado una base de datos vacía llamada `paparcapp` en su servidor PostgreSQL.
2. **Estructura Base:** Abra la herramienta de consulta (**Query Tool**) sobre esa base de datos y ejecute el contenido de `01_tables.sql`.
3. **Reglas de Negocio:** Ejecute `02_constraints.sql` para aplicar las relaciones y restricciones de seguridad.
4. **Optimización:** Ejecute `03_indexes.sql` para generar los índices de rendimiento.
5. **Carga de Datos:** Ejecute `04_initial_data.sql` para poblar la base de datos con usuarios y reservas de prueba.

---

## 🛠️ Comandos de Mantenimiento Útiles

### Resetear Base de Datos (Limpieza Total)
Para vaciar todas las tablas y reiniciar los contadores autoincrementales (ID) a 1 sin borrar la estructura, ejecute:

```sql
TRUNCATE TABLE 
    customer, vehicle, reservation, parking_spot, 
    main_service, additional_service, photo_evidence, 
    notification, reservation_additional_service 
RESTART IDENTITY CASCADE;