function cargarAlumnos(e){
    e.preventDefault();
    let lista = e.target.lista.value.split('\n');
    let data = [];
    for(let elem of lista){
        let alumno = {};
        alumno.nombres = elem.split(' ')[0];
        alumno.apellidos = elem.split(' ')[1];
        alumno.curso = e.target.curso.value;
    data.push(alumno);
 }

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };
    fetch('http://localhost:3000/api/alumnos', options);
    e.target.reset();
}

function cargarLista(e){
    const materiaId = e.target.value;
    fetch(`http://localhost:3000/api/alumnos/${materiaId}`)
        .then(res => res.json())
        .then(data => {
            let tbody = document.querySelector('#tableBody'); 
            tbody.innerHTML = '';
            const btns = ['P', 'A', 'T', 'RA'];
            
            let i = 1;

            for(let alumno of data){
                let tr = document.createElement('tr');
                let aid = document.createElement('td');
                
                let orden = document.createElement('td');

                let nombre = document.createElement('td');
                let apellido = document.createElement('td');

                aid.textContent = alumno.id;
                
                orden.textContent = i;

                nombre.textContent = alumno.nombres;
                apellido.textContent = alumno.apellidos;

                tr.append(aid, orden, nombre, apellido);

                let td = document.createElement('td'); 
                for(let text of btns){
                    let button = document.createElement('button');
                    button.textContent = text;
                    button.onclick = handleClick;
                    td.append(button);
                }
                tr.append(td);
                tbody.append(tr);

                i++;
            }
        });
}

function cargarCursos(){
    fetch('http://localhost:3000/api/cursos/')
        .then(res => res.json())
        .then(data =>{
            const select = document.querySelector('#cursos');
            select.innerHTML = '';
            for(let curso of data){
                const option = document.createElement('option');
                const {anio, division, especialidad} = curso; 
                option.textContent = `${anio} ${division} ${especialidad}`;
                option.value = curso.id;
                select.append(option);
            }
        })
        .catch(err => alert(err.stack));
}

function cargarMaterias(e){
    const cursoId = e.target.value;
    fetch('http://localhost:3000/api/materias/' + cursoId)
        .then(res => res.json())
        .then(data =>{
            const select = document.querySelector('#materias');
            select.innerHTML = '';
            for(let materia of data){
                const option = document.createElement('option');
                option.textContent = materia.nombre;
                option.value = materia.id;
                select.append(option);
            }
        });
}

function handleClick(event){
    let row = event.target.parentElement.parentElement;
    let idAlumno = row.children[0].textContent;
    let select = document.querySelector('#materias'); 
    let idMateria = select.value;
    let datos = {
        tipo: event.target.textContent,
        alumno: idAlumno,
        materia: idMateria
    };

    const options = {
        method: 'POST',
        body: JSON.stringify(datos),
        headers: {'Content-Type': 'application/json'}
    }

    const url = 'http://localhost:3000/api/asistencias';
    fetch(url, options)
        .then(res => res.json())
        .then(data => {
            console.log(data);
        })
    .catch(err => alert(err.stack));

}

document.addEventListener('DOMContentLoaded', cargarCursos);
document.querySelector('#cursos').addEventListener('change', cargarMaterias);
document.querySelector('#materias').addEventListener('change', cargarLista);