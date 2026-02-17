/**
 * Gestionamos la configuración de la base de datos a POSTGRESQL
 * Usamos un pool de conexiones para optimizar el rendimiento y la escalabilidad
 * Actúa como un Singleton implicito que asegura que solo haya una instancia del pool de conexiones
*/

/**
 *  QUE ES UN POOL DE CONEXIONES?
 * Un pool es un conjunto de conexiones abiertas y reutilizables a POSTGRESQL
 * En lugar de abrir una nueva conexión nueva cada vez que se necesita acceder a la base de datos,
 * se usa una conexión ya abierta, cuando terminas la la devuelves al pool
 * esta conexión no se cierra, sino que queda disponible para futuras solicitudes
 * Esto reduce la sobrecarga de abrir y cerrar conexiones repetidamente
*/

const { Pool } = require('pg');
require('dotenv').config();

// Instanciamos el pool de conexiones con la configuración necesaria dada por las variables de entorno (.env)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// -- DEPURACIÓN Y MONITOREO -- 

//Evento para avisar de cuando se conecta una nueva conexión al pool
pool.on('connect', () => {
    console.log('Nueva conexión establecida con la base de datos');
});

// Manejo de errores en las conexiones del pool
pool.on('error',(err) =>{
    console.error('Error inesperado en el cliente de la base de datos', err);
    process.exit(-1); // 0 indica salida sin errores, cualquier otro valor indica que el programa termino con errores
});

module.exports = {
    query: (text, params) => pool.query(text, params), // función que ejecute consultas SQL usando el pool. Permite usar db.query directamente
    pool: pool, // exportamos el pool completo por si necesitamos acceder a funcionalidades avanzadas
    connect: () => pool.connect() // función para obtener una conexión del pool, útil para transacciones
};