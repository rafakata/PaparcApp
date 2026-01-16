/**
 * Módulo para la gestión de la base de datos SQLite.
 * Utiliza el patrón Singleton para asegurar que solo hay una instancia de la base de datos.
 */

class Database {

    static #db = null; // instancia privada de la base de datos

    constructor() { // evitar instanciación directa, lanza un error si se intenta
        throw new Error('No se puede instanciar. Usa .getInstance()');
    };

    static getInstance(dbPath) { // devuelve la instancia única de la base de datos

        if (Database.#db === null) { // si no existe la instancia, crearla

            if (!dbPath) { // comprobar que la variable de entorno está definida
                throw new Error('Debes pasar la ruta de la BD (dbPath) en la primera llamada a getInstance');
            }

            //creamos la instancia de la base de datos
            try {
                Database.#db = require('better-sqlite3')(dbPath, { verbose: console.log });
                console.log('Conexión a la base de datos establecida en:', dbPath);

                //incializar las tablas si no existen
                require('./initialize-users')(Database.#db);
                require('./initialize-workers')(Database.#db);

            } catch(error) {
                console.error('Error al conectar con la base de datos:', error.message);
                throw error;
            }

        }
        return Database.#db; // devolver la instancia existente
    }

    // método para preparar sentencias SQL
    static prepare (sql) {
        if (Database.#db === null) {
            throw new Error('La base de datos no ha sido inicializada. Llama a getInstance(dbPath) primero.');
        }
        return Database.#db.prepare(sql);
    }
}

module.exports = Database;