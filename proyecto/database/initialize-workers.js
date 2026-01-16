// Inicializa la tabla trabajadores

module.exports = (db) =>{

    const sql = `
        CREATE TABLE IF NOT EXISTS WORKERS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workername VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(150) NOT NULL,
            employee_id TEXT UNIQUE NOT NULL,
            role VARCHAR(50) DEFAULT 'admin' NOT NULL
        )
    `;

    db.prepare(sql).run();

    // si no hay trabajadores, crear uno por defecto
    const count = db.prepare('SELECT count(*) as total FROM WORKERS').get();
    if (count.total === 0) {
        db.prepare('INSERT INTO WORKERS (workername,password,employee_id) VALUES (?,?,?)')
          .run('admin', 'Admin123!', 'emp-001');
    };
}