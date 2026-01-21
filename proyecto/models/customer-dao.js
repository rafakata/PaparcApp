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

    async getUserById(id) {

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

}

// Exportamos una instancia unica de CustomerDAO (Patron Singleton)
// en el resto de la app solo tendremos que hacer: customerDAO.getCustomerByEmail(email)
module.exports = new CustomerDAO();