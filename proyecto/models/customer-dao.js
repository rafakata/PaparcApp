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
    async getCustomerById(id) { 

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

    /**
     * Obtiene un cliente por su teléfono, útil para el proceso de reserva sin registro, donde el cliente solo proporciona su teléfono y nombre.
     * @param {string} phone - teléfono del cliente a buscar
     * @returns - devuelve el usuario encontrado
     * @throws {Error} - Si ocurre un error durante la consulta a la base de datos.
    */
    async getCustomerByPhone(phone) {

        const sql = 'SELECT * FROM customer WHERE phone = $1';

        try {

            const result = await db.query(sql, [phone]);
            return result.rows[0] || null; //devolvemos el usuario encontrado o null si no existe

        } catch (error) {

            console.error('Error al obtener el usuario por teléfono:', error);
            throw new Error('Error al obtener el usuario por teléfono', { cause: error });
        }

    }

    /**
     * Crea un cliente invitado (sin registro) a partir de sus datos.
     * @param {object} userData 
     * @returns - ID del cliente invitado creado
     * @throws {Error} - Si ocurre un error durante la inserción en la base de datos, como por ejemplo si el teléfono ya esta registrado, o si el email proporcionado ya esta registrado (en este caso el email es opcional, pero si se proporciona debe ser unico)
     * NOTA: El email es opcional para los clientes invitados, pero si se proporciona debe ser unico, para evitar conflictos con usuarios registrados. Si el email no se proporciona, se insertará como null, lo que permite que varios clientes invitados compartan el mismo email null sin violar la restricción UNIQUE.
    */
    async createGuestCustomer(userData) {

        const sql = `
            INSERT INTO customer (full_name,email,phone,type)
            VALUES ($1, $2, $3, 'NO-REGISTRADO')
            RETURNING id_customer 
        `;

        try {

            const values = [
                userData.full_name,
                userData.email || null, //si el email no se proporciona, insertamos null para evitar violar la restriccion UNIQUE
                userData.phone
            ]

            const result = await db.query(sql, values);

            return result.rows[0].id_customer; //devolvemos el id del nuevo usuario invitado creado

        } catch (error) {

            if (error.code === '23505') { //23505 es el codigo de error de violacion de restriccion UNIQUE en Postgres
                throw new Error('El email ya está registrado.');
            }
            console.error('Error al crear el nuevo cliente invitado:', error);
            throw new Error('Error al crear el nuevo cliente invitado', { cause: error });

        }

    }

    /**
     * Obtiene los datos de loe vehículos asociados a un cliente, lo necesitamos para mostrarlo en la vista de perfil de cliente
     * y para mostrarlo como opción a la hora de hacer una reserva.
     * @param {number} customerId - ID del cliente
     * @return {Array} - Lista de vehículos asociados al cliente
     * @throws {Error} - Si ocurre un error durante la consulta a la base de datos.
    */
    async getVehiclesByCustomerId(customerId) { 

        const sql = `
            SELECT v.* FROM vehicle v
            JOIN customer_vehicle cv ON v.id_vehicle = cv.id_vehicle
            WHERE cv.id_customer = $1
            ORDER BY v.id_vehicle ASC
        `;

        try {

            const result = await db.query(sql, [customerId]);
            return result.rows; //devolvemos la lista de vehículos asociados al cliente, si no tiene vehículos asociados devuelve una lista vacía

        } catch (error) {

            console.error('Error al obtener los vehículos del cliente:', error);
            throw new Error('Error al obtener los vehículos del cliente', { cause: error });
        }

    }

    /**
     * Actualiza los datos de un cliente a partir de su ID y los nuevos datos proporcionados.
     * @param {*} customerId 
     * @param {*} full_name 
     * @param {*} email 
     * @param {*} phone
     * @returns - devuelve el cliente actualizado
     * @throws {Error} - Si ocurre un error durante la actualización en la base de datos, como por ejemplo si el nuevo email proporcionado ya esta registrado por otro usuario.
    */
    async updateCustomerData(customerId, full_name, email, phone) {

        const sql = `
            UPDATE customer 
            SET full_name = $1, email = $2, phone = $3 
            WHERE id_customer = $4
        `;

        try {

            await db.query(sql, [full_name, email, phone, customerId]); 
            return true;

        } catch (error) {

            console.error('Error al actualizar datos del cliente:', error);
            throw new Error('Error en BD', { cause: error });

        }

    }

    /**
     * Actualiza la contraseña de un cliente a partir de su ID y el nuevo hash de contraseña proporcionado.
     * @param {*} customerId 
     * @param {*} passwordHash 
     * @returns 
     * @throws {Error} - Si ocurre un error durante la actualización en la base de datos, como por ejemplo si el nuevo hash de contraseña no cumple con los requisitos de seguridad (aunque esto se debería validar antes de llamar a este método, es buena práctica también validar en el DAO para evitar inconsistencias).
    */
    async updateCustomerPassword(customerId, passwordHash) {

        const sql = `UPDATE customer SET password_hash = $1 WHERE id_customer = $2`;

        try {

            await db.query(sql, [passwordHash, customerId]);
            return true;

        } catch (error) {

            console.error('Error al actualizar contraseña:', error);
            throw new Error('Error en BD', { cause: error });

        }

    }
    
}

// Exportamos una instancia unica de CustomerDAO (Patron Singleton)
// en el resto de la app solo tendremos que hacer: customerDAO.getCustomerByEmail(email)
module.exports = new CustomerDAO();