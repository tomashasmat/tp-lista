const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Lista',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
connection.connect((err =>){
  if(err) {
          console.error('Error Database', err);
          return;
  }
  console.log('Conexion existosa a MYSQL')
});
module.exports = conecction;
