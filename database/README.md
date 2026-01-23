# 📂 Database - Parking Valet (PaparCapp)

Este directorio contiene los scripts SQL necesarios para la creación, configuración y puesta en marcha de la base de datos de la aplicación **PaparCapp**. La estructura se ha modularizado para separar la creación de objetos, las reglas de negocio y la optimización de rendimiento.

## 🏗️ Estructura de Scripts SQL

Los archivos deben ejecutarse en el orden numérico indicado para evitar errores de dependencias (Foreign Keys):

| Orden | Archivo | Función Principal |
| :--- | :--- | :--- |
| **01** | `01_schema.sql` | Creación de la base de datos `paparcapp` y configuración del entorno. |
| **02** | `02_tables.sql` | Definición de tablas (DDL). Crea las entidades (Customer, Vehicle, Reservation, etc.). |
| **03** | `03_constraints.sql` | Lógica de integridad: Foreign Keys y Check Constraints (Reglas de negocio). |
| **04** | `04_indexes.sql` | Estrategia de optimización: Índices para búsquedas rápidas por matrícula, fechas y estados. |
| **05** | `05_initial_data.sql` | Datos maestros y de prueba. Carga servicios y un flujo de reserva completo. |

---

## 🚀 Guía de Instalación (pgAdmin 4)

1. **Creación del entorno:** Ejecute `01_schema.sql` para inicializar el contenedor.
2. **Generación de estructura:** Abra una herramienta de consulta (**Query Tool**) sobre la base de datos creada y ejecute en orden los archivos `02` y `03`.
3. **Optimización:** Ejecute `04_indexes.sql`. Notará que las consultas sobre la tabla `reservation` son significativamente más rápidas.
4. **Carga de datos:** Ejecute `05_initial_data.sql` para disponer de un entorno funcional para pruebas.



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