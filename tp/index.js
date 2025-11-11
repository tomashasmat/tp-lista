const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const conn = mysql.createConnection({
  host: 'localhost',
  user:'root',
  password:'',
  database: 'tp',
  port: 3306
});

app.get('/api/asistencias/hoy/:materia/:alumno', (req, res) => {
  conn.query('SELECT tipo FROM registros WHERE DATE(creado) = DATE(CURRENT_TIMESTAMP) AND materia = ? AND alumno = ?', [req.params.materia, req.params.alumno], (err, rs) => {
    res.status(200).json(rs);
  });
});

app.get('/api/asistencias/:materia/:fecha', (req, res) => {
  const params = [req.params.materia, req.params.fecha];
  conn.query('SELECT r.id, a.apellidos, a.nombres, tipo, TIME(creado) AS creado FROM registros r JOIN alumnos a ON a.id = r.alumno WHERE materia = ? AND DATE(creado) = ?', params, (err, rs) => {
    let i = 1;
    for (let e of rs) { e.orden = i; i++; }
    res.status(200).json(rs);
  });
});

app.post('/api/alumnos', (req, res) => {
  let query = 'INSERT INTO alumnos(nombres, apellidos, curso) VALUES ';
  console.log(req.body);
  let lista = req.body; 
  for (let i = 0; i < lista.length; i++) {
    let { nombres, apellidos, curso } = lista[i];
    query += `('${nombres}','${apellidos}',${curso})`;
    if (i != lista.length - 1) query += ', ';
  }
  console.log(query);
  conn.query(query, (err, rs) => {
    res.status(200).json({ msg: 'INSERTS OK' });
  });
});

app.put('/api/asistencias/:id', (req, res) => {
  const { tipo, creado } = req.body;
  const data = [tipo, creado, req.params.id];
  console.log(data);
  conn.query('UPDATE registros SET tipo = ?, creado = ? WHERE id = ?', data, (err, rs) => {
    if (err) console.error(err);
    res.status(200).json({ msg: 'update ok' });
  });
});

app.post('/api/asistencias', (req, res) => {
  const { tipo, alumno, materia } = req.body;

  const selectQuery = 'SELECT * FROM registros WHERE alumno = ? AND materia = ? AND DATE(creado) = DATE(CURRENT_TIMESTAMP)';

  conn.query(selectQuery, [alumno, materia], (err, rs) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: 'Error en la base de datos' });
    }

    if (rs.length > 0) {

    const existingRecordId = rs[0].id;

      const updateQuery = 'UPDATE registros SET tipo = ?, creado = CURRENT_TIMESTAMP WHERE id = ?';
      const updateData = [tipo, existingRecordId];

      conn.query(updateQuery, updateData, (updateErr, updateRs) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({ msg: 'Error al actualizar el registro' });
        }
        res.status(200).json({ msg: 'Update OK' }); 
      });

} else {

      const insertQuery = 'INSERT INTO registros(tipo, alumno, materia) VALUES (?,?,?)';
      const insertData = [tipo, alumno, materia];

      conn.query(insertQuery, insertData, (insertErr, insertRs) => {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ msg: 'Error al insertar el registro' });
      }
      res.status(201).json({ msg: 'Alta OK' });
      });
    }
  });
});

app.get('/api/cursos', (req, res) => {
  conn.query('SELECT * FROM cursos', (err, rs) => {
    res.status(200).json(rs);
  });
});
app.get('/api/alumnos/:materia', (req, res) => {
  const materia = req.params.materia;
  const q = 'SELECT a.id, a.nombres, a.apellidos FROM alumnos a JOIN cursos c ON a.curso = c.id JOIN materias m ON m.curso = c.id WHERE m.id = ? ORDER BY a.apellidos, a.nombres';
  conn.query(q, [materia], (err, rs) => {
    res.status(200).json(rs);
  });
});
app.get('/api/materias/:curso', (req, res) => {
  const curso = req.params.curso;
  conn.query('SELECT * FROM materias WHERE curso = ?', [curso], (err, rs) => {
    res.status(200).json(rs);
  });
});

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

conn.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        return;
    }
    
    console.log('Base de datos conectada');
    
    app.listen(3000, () => console.log('Server online en localhost:3000'));
});
