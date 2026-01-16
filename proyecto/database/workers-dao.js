// Definicion de la clase UserDAO para gestionar las operaciones de la tabla 'users' en la base de datos

const Database = require("better-sqlite3");

class WorkersDAO {

    #database = null;

    constructor(database) {
        this.#database = database;
    }

    //metodo para obtener un trabajador por su employee_id
    getWorkerByEmployee_id(employee_id) {
        const sql = 'SELECT * FROM WORKERS WHERE employee_id = ?';
        return this.#database.prepare(sql).get(employee_id);
    }
}

module.exports = WorkersDAO;