/*const mysql = require('mysql2/promise');

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
*/
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const conn = mysql.createConnection({
  host: 'localhost',
  database: 'tp'
});

app.post('/api/alumnos', (req, res) => {
  let query = 'INSERT INTO alumnos(nombres, apellidos, curso) VALUES';
  console.log(req.body);
  let lista = req.body;
  for(let i = 0; i < lista.length; i++){
    let { nombres, apellidos, curso } = lista[i];
    query += `('${nombres}', '${apellidos}',  '${curso}')`;
    if(i != lista.length - 1) query += ', ';
  }
  console.log(query);
  conn.query(query, (err, rs) => {
    res.status(200).json({ msg: 'ANDAN LOS INSERTS' });
  });
});

app.post('/api/asistencias', (req, res) => {
  const { tipo, alumno, materia } = req.body;
  conn.query('SELECT * FROM registros WHERE alumno = ? AND materia = ? AND DATE(creado) LIKE DATE(CURRENT_TIMESTAMP)'), [alumno, materia], (err, rs) => {
    console.log(rs);
    if(rs.length > 0) return res.status(400).json({ msg: 'no'});
    const data = [tipo, alumno, materia];
    const q = 'INSERT INTO registros(tipo, alumno, materia) VALUES (?,?,?)';
    conn.query(q, data, (err, rs) =>{
    res.status(201).json({ msg: 'Alta funciona' });
    });
  });
});

app.get('/api/cursos', (req, res) => {
  conn.query('SELECT * FROM cursos', (err, rs) => {
    res.status(200).json(rs);
  });
});

app.get('/api/alumnos/:materia', (req, res) => {
  const materia = req.params.materia;
  const q = 'SELECT a.id, a.nombres, a.apellidos FROM alumnos a JOIN cursos c ON a.curso = c.id JOIN materias m ON m.curso = c.id WHERE m.id = ?';
  conn.query(q, [materia], (err, rs) => {
    res.status(200).json(rs);
  })
});

app.get('/api/alumnos/:curso', (req, res) => {
  const curso = req.params.curso;
  conn.query('SELECT * FROM materias WHERE curso = ?', [curso], (err, rs) => {
    res.status(200).json(rs);
  });
});

conn.connect(() => console.log('BD conectada'));
