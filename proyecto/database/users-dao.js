// Definicion de la clase UserDAO para gestionar las operaciones de la tabla 'users' en la base de datos

const Database = require("better-sqlite3");

class UsersDAO {

    #database = null;

    constructor(database) {
        this.#database = database;
    }

    //metodo para obtener un usuario por su nombre de usuario
    getUserByUsername(username) {
        const sql = 'SELECT * FROM USERS WHERE username = ?';
        return this.#database.prepare(sql).get(username);
    }
}

module.exports = UsersDAO;