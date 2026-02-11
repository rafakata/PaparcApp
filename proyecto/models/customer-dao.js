/**
 * Clase que representa el acceso a datos para los usuarios.
 * Se encarga de toda la interaccion SQL relacionada con los usuarios.
*/
//-- TEORIA SOBRE async/await --
/**
 * async/await es una forma moderna de manejar operaciones asincronas en JavaScript
 * Indicamos que una funcion sera asíncrona usando la palabra async, cuando dentro de esa función
 * usamos await, pausamos la ejecución de esa función hasta que la promesa se resuelva.
 * Es decir esta funcion no bloquea el hilo principal y espera 'dormida' hasta que la BD responda
*/

// Importamos el modulo de conexion a la base de datos
const db = require('../config/database');


class CustomerDAO {

    /**
     * Obtiene un cliente por su email.
     * @param {string} email - Email del cliente a buscar.
     * @return {Object|null} - Objeto del cliente o null si no se encuentra.
     * @throws {Error} - Si ocurre un error durante la consulta a la base de datos.
    */
    async getCustomerByEmail(email) {

        const sql = 'SELECT * FROM customer WHERE email = $1'; //$1 es un placeholder para evitar inyeccion SQL (similar a ? en otros motores)

        try {

            const result = await db.query(sql, [email]); //pasamos el email como parametro para el placeholder $1

            if (result.rows.length > 0) return result.rows[0]; //devolvemos el primer usuario encontrado

            return null; //no se encontro ningun usuario con ese email

        } catch (error) {

            // si la BD lanza un error, lo capturamos y lanzamos una excepcion personalizada
            console.error('Error al obtener el usuario por email:', error);
            throw new Error('Error al obtener el usuario por email', { cause: error }); // ganamos lanzar una excepcion y a su vez conservar la causa original

        }
    }

    /**
     * Obtiene un cliente por su ID.
     * @param {number} id - ID del cliente a buscar.
     * @returns {Object|null} - Objeto del cliente o null si no se encuentra.
     * @throws {Error} - Si ocurre un error durante la consulta a la base de datos.
    */
    async getCustomerById(id) { // este metodo no se esta usando actualmente, pero es util tenerlo para futuras funcionalidades, como mostrar el perfil del usuario o su historial de reservas, donde necesitaremos obtener sus datos a partir de su ID de sesión.

        const sql = 'SELECT * FROM customer WHERE id_customer = $1';

        try {

            const result = await db.query(sql, [id]);
            
            // forma abreviada de escribir un if-else
            return result.rows[0] || null; //devolvemos el usuario encontrado o null si no existe

        } catch (error) {

            console.error('Error al obtener el usuario por ID:', error);
            throw new Error('Error al obtener el usuario por ID', { cause: error });      

        }
    }

    /**
     * Registra un nuevo cliente estándar.
     * @param {Object} userData - Debe contener { nombre, email, passwordHash }
     * @return {number} - ID del nuevo cliente creado.
     * @throws {Error} - Si ocurre un error durante la inserción en la base de datos.
     * NOTA SEGURIDAD: Forzamos el type a 'REGULAR' para evitar que alguien se registre como ADMIN.
    */
    async createCustomer(userData) {

        const sql = `
            INSERT INTO customer (full_name,email,password_hash,type)
            VALUES ($1, $2, $3, 'REGISTRADO')
            RETURNING id_customer 
        `; // devolvemos el id del nuevo usuario creado, util para futuras referencias, ahorra una consulta extra
        // introducimos el type como 'REGISTRADO' por defecto para evitar que un usuario se cree a si mismo como ADMIN

        try {

            const values = [
                userData.full_name,
                userData.email,
                userData.password_hash
            ]

            const result = await db.query(sql, values);

            return result.rows[0].id_customer; //devolvemos el id del nuevo usuario creado

        } catch (error) {

            if (error.code === '23505') { //23505 es el codigo de error de violacion de restriccion UNIQUE en Postgres
                throw new Error('El email ya está registrado.');
            }
            console.error('Error al crear el nuevo usuario:', error);
            throw new Error('Error al crear el nuevo usuario', { cause: error });

        }
    }

}

// Exportamos una instancia unica de CustomerDAO (Patron Singleton)
// en el resto de la app solo tendremos que hacer: customerDAO.getCustomerByEmail(email)
module.exports = new CustomerDAO();