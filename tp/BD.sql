CREATE DATABASE Lista;
USE Lista;

CREATE TABLE cursos(
    id int AUTO_INCREMENT PRIMARY KEY,
    anio INT,
    division INT,
    especialidad ENUM('Automotores','Computacion','Ciclo Basico'),
    aula INT
);

CREATE TABLE alumnos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(255),
    apellidos VARCHAR(255),
    dni INT,
    curso INT,
    FOREIGN KEY (curso) REFERENCES cursos(id)    
);

CREATE TABLE materias(
    id INT AUTO_INCREMENT PRIMARY KEY,
    horas INT,
    profesor VARCHAR(255),
    contraturno BOOLEAN,
    nombre VARCHAR(255),
    curso INT,
    FOREIGN KEY (curso) REFERENCES cursos(id)
);

CREATE TABLE registros(
    id INT AUTO_INCREMENT PRIMARY KEY,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo ENUM('P','T','A','RA','AP'),
    alumno INT,
    materia INT,
    FOREIGN KEY (alumno) REFERENCES alumnos(id),
    FOREIGN KEY (materia) REFERENCES materias(id)
);