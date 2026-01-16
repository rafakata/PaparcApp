//Inicializa los usuarios en la base de datos si es necesario

module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS USERS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(150) NOT NULL
        )
    `;

    db.prepare(sql).run();

    // si no hay usuarios, crear uno por defecto
    const count = db.prepare('SELECT count(*) as total FROM USERS').get();
    if (count.total === 0) {
        db.prepare('INSERT INTO USERS (username,password) VALUES (?,?)').run('cliente1','Cliente123!');
    }

};