//TESTS UNITARIOS SIMPLES

//-------------------------------------------------------------------------------
/*
//COMPROBAR CREDENCIALES DE LA BASE DE DATOS POSTGRESQL
// test-db.js archivo rapido para verificar las credenciales de la base de datos PostgreSQL
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

client.connect()
    .then(() => {
        console.log('✅ ¡Credenciales CORRECTAS! Conexión exitosa.');
        return client.end();
    })
    .catch(err => {
        console.error('❌ Credenciales INCORRECTAS o servidor apagado.');
        console.error('Error:', err.message); // Te dirá si es password, usuario o base de datos lo que falla
    });
*/
//-------------------------------------------------------------------------------




//-------------------------------------------------------------------------------
/*
//COMPROBAR CONEXIÓN A LA BASE DE DATOS USANDO POOL DE PG
// test-db.js archivo rapido para verificar la conexión a la base de datos PostgreSQL usando Pool
const db = require('./config/database'); // Asegúrate que la ruta es correcta

async function probarConexion() {
    console.log('⏳ Intentando conectar a la base de datos...');
    
    try {
        // Hacemos una consulta tonta: pedir la fecha y hora actual
        const res = await db.query('SELECT NOW() as hora_actual');
        
        console.log('✅ ¡CONEXIÓN EXITOSA!');
        console.log('🕒 Hora del servidor Postgres:', res.rows[0].hora_actual);

    } catch (err) {
        console.error('❌ ERROR GRAVE DE CONEXIÓN:', err.message);
    } finally {
        // Importante: Forzamos el cierre del script, si no, el Pool 
        // mantendría la terminal abierta esperando más consultas.
        process.exit();
    }
}

probarConexion();
*/
//-------------------------------------------------------------------------------



//-------------------------------------------------------------------------------
/*
// TEST UNITARIO DEL DAO DE USUARIOS
// test-dao.js archivo para probar las funciones del CustomerDAO

const customerDAO = require('./models/customer-dao'); 

async function probarCustomerDAO() {
    console.log('🧪 INICIANDO TEST UNITARIO DE CUSTOMER-DAO...\n');

    // --- PRUEBA 1: BUSCAR POR EMAIL (EXISTENTE) ---
    // Usamos el email de Carlos que insertamos en los datos iniciales
    const emailTest = 'carlos@email.com'; 
    
    console.log(`1️⃣  Buscando usuario por email: "${emailTest}"...`);
    
    try {
        // Usamos tu método getCustomerByEmail
        const usuario = await customerDAO.getCustomerByEmail(emailTest);
        
        if (usuario) {
            console.log('   ✅ ÉXITO: Usuario encontrado.');
            console.log(`      -> ID: ${usuario.id_customer}`);
            console.log(`      -> Nombre: ${usuario.full_name}`);
            console.log(`      -> Email: ${usuario.email}`); // Columna correcta
            console.log(`      -> Tipo: ${usuario.type}`);   // Columna correcta
        } else {
            console.error('   ⚠️ FALLO: El usuario debería existir pero el DAO devolvió null.');
        }

    } catch (error) {
        console.error('   ❌ ERROR DE EJECUCIÓN:', error.message);
    }

    // --- PRUEBA 2: BUSCAR POR ID (RECUPERACIÓN DE SESIÓN) ---
    // Si Carlos es el primero, su ID debería ser 1
    const idTest = 1;

    console.log(`\n2️⃣  Buscando usuario por ID: ${idTest}...`);

    try {
        // Usamos tu método getUserById
        const usuarioPorId = await customerDAO.getUserById(idTest);

        if (usuarioPorId) {
            console.log(`   ✅ ÉXITO: Usuario recuperado por ID.`);
            console.log(`      -> Nombre: ${usuarioPorId.full_name}`);
        } else {
            console.error('   ⚠️ FALLO: No se encontró el usuario con ID 1.');
        }
    } catch (error) {
        console.error('   ❌ ERROR DE EJECUCIÓN:', error.message);
    }

    // --- PRUEBA 3: BUSCAR USUARIO INEXISTENTE ---
    const emailFalso = 'nadie@existe.com';
    console.log(`\n3️⃣  Probando email inexistente: "${emailFalso}"...`);

    try {
        const nada = await customerDAO.getCustomerByEmail(emailFalso);
        
        if (nada === null) {
            console.log('   ✅ ÉXITO: El DAO devolvió null correctamente.');
        } else {
            console.error('   ⚠️ FALLO: Devolvió datos para un usuario que no existe:', nada);
        }
    } catch (error) {
        console.error('   ❌ ERROR DE EJECUCIÓN:', error.message);
    }

    console.log('\n🏁 TEST FINALIZADO. Cerrando proceso.');
    process.exit();
}

// Ejecutamos la función
probarCustomerDAO();
*/
//-------------------------------------------------------------------------------



//-------------------------------------------------------------------------------