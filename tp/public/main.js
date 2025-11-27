const btns = ['P', 'A', 'T', 'RA']; 

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
    
    document.querySelector('#bodyHistorial').innerHTML = '';
    document.querySelector('#tablaHistorial').style.display = 'none';
    document.querySelector('#mensajeHistorial').textContent = '';
    
    fetch(`http://localhost:3000/api/alumnos/${materiaId}`)
        .then(res => res.json())
        .then(data => {
            let tbody = document.querySelector('#tableBody'); 
            tbody.innerHTML = ''; 
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
                    button.classList.add(`btn-${text.toLowerCase()}`); 
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
            const selectFiltro = document.querySelector('#cursos');
            const selectCarga = document.querySelector('#cursoCarga');
            selectFiltro.innerHTML = '';
            selectCarga.innerHTML = '';
            
            for(let curso of data){
                const {anio, division, especialidad, id} = curso; 
                const textContent = `${anio} ${division} ${especialidad}`;
                const optionFiltro = document.createElement('option');
                optionFiltro.textContent = textContent;
                optionFiltro.value = id;
                selectFiltro.append(optionFiltro);
                const optionCarga = document.createElement('option');
                optionCarga.textContent = textContent;
                optionCarga.value = id;
                selectCarga.append(optionCarga);
            }
            
            cargarMaterias({target: selectFiltro});
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
            if(data.length > 0) cargarLista({target: select});
        });
}

function handleClick(event){
    
    let botonClickeado = event.target;
    let celdaBotonera = botonClickeado.parentElement; 
    
    let botonesHermanos = celdaBotonera.children;
    for(let btn of botonesHermanos){
        btn.classList.remove('selected');
    }

    botonClickeado.classList.add('selected');

    let row = celdaBotonera.parentElement; 
    let idAlumno = row.children[0].textContent; 
    let select = document.querySelector('#materias'); 
    let idMateria = select.value;
    
    let datos = {
        tipo: botonClickeado.textContent,
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
            console.log('Asistencia registrada/actualizada:', data);
        })
        .catch(err => console.error('Error al enviar asistencia:', err));
}

function buscarPorFecha(e) {
    const fecha = e.target.value;
    const materiaSelect = document.querySelector('#materias');
    const materiaId = materiaSelect.value;

    if (!materiaId) {
        alert("Por favor selecciona una materia primero");
        return;
    }

    const url = `http://localhost:3000/api/asistencias/${materiaId}/${fecha}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const tabla = document.querySelector('#tablaHistorial');
            const tbody = document.querySelector('#bodyHistorial');
            const mensaje = document.querySelector('#mensajeHistorial');
            
            tbody.innerHTML = ''; 

            if (data.length === 0) {
                tabla.style.display = 'none';
                mensaje.textContent = 'No se encontraron registros para esta fecha.';
            } else {
                mensaje.textContent = '';
                tabla.style.display = 'table'; 
                
                for (let registro of data) {
                    let tr = document.createElement('tr');
                    tr.dataset.registroId = registro.id; 
                    
                    let tdOrden = document.createElement('td');
                    tdOrden.textContent = registro.orden;

                    let tdNombre = document.createElement('td');
                    tdNombre.textContent = `${registro.apellidos}, ${registro.nombres}`;
                    tdNombre.dataset.nombreCompleto = tdNombre.textContent;

                    let tdTipo = document.createElement('td');
                    tdTipo.textContent = registro.tipo;
                    
                    if(registro.tipo === 'P') tdTipo.style.backgroundColor = '#8ce99a';
                    if(registro.tipo === 'A') tdTipo.style.backgroundColor = '#ff8787';
                    if(registro.tipo === 'T') tdTipo.style.backgroundColor = '#ffc078';
                    if(registro.tipo === 'RA') tdTipo.style.backgroundColor = '#a5d8ff';


                    let tdHora = document.createElement('td');
                    tdHora.textContent = registro.creado.substring(0, 5);
                    tdHora.dataset.horaOriginal = registro.creado;
                    
                    let tdAcciones = document.createElement('td');
                    let btnModificar = document.createElement('button');
                    btnModificar.textContent = 'Modificar';
                    btnModificar.classList.add('btn-modificar-historial');
                    btnModificar.onclick = modificarRegistro;
                    tdAcciones.append(btnModificar);

                    tr.append(tdOrden, tdNombre, tdTipo, tdHora, tdAcciones);
                    tbody.append(tr);
                }
            }
        })
        .catch(err => console.error(err));
}
function modificarRegistro(e) {
    const btn = e.target;
    const tr = btn.closest('tr');

    if (tr.classList.contains('editing')) return;

    tr.classList.add('editing');

    const registroId = tr.dataset.registroId;
    const nombreCompleto = tr.querySelector('td:nth-child(2)').dataset.nombreCompleto;
    const tipoActual = tr.querySelector('td:nth-child(3)').textContent;
    const horaActual = tr.querySelector('td:nth-child(4)').textContent;

    const selectTipo = document.createElement('select');
    selectTipo.id = `select-${registroId}`;
    for (const tipo of ['P', 'A', 'T', 'RA']) {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        if (tipo === tipoActual) option.selected = true;
        selectTipo.append(option);
    }

    const inputHora = document.createElement('input');
    inputHora.type = 'time';
    inputHora.id = `hora-${registroId}`;
    inputHora.value = horaActual.substring(0, 5); 

    const btnGuardar = document.createElement('button');
    btnGuardar.textContent = 'Guardar';
    btnGuardar.classList.add('btn-guardar-historial');
    btnGuardar.onclick = guardarModificacion;
    
    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.classList.add('btn-cancelar-historial');
    btnCancelar.onclick = cancelarModificacion;
    
    tr.querySelector('td:nth-child(2)').innerHTML = `<b>${nombreCompleto}</b>`;
    tr.querySelector('td:nth-child(3)').innerHTML = '';
    tr.querySelector('td:nth-child(3)').append(selectTipo);
    tr.querySelector('td:nth-child(4)').innerHTML = '';
    tr.querySelector('td:nth-child(4)').append(inputHora);

    const tdAcciones = tr.querySelector('td:nth-child(5)');
    tdAcciones.innerHTML = '';
    tdAcciones.append(btnGuardar, btnCancelar);
}
function cancelarModificacion(e) {
    const tr = e.target.closest('tr');
    tr.classList.remove('editing');
    const inputFecha = document.querySelector('#fechaBusqueda');
    inputFecha.dispatchEvent(new Event('change'));
}


function guardarModificacion(e) {
    const tr = e.target.closest('tr');
    const registroId = tr.dataset.registroId;
    const materiaId = document.querySelector('#materias').value;

    const tipo = tr.querySelector('select').value;
    const hora = tr.querySelector('input[type="time"]').value;

    if (!hora) {
        alert('Por favor ingresa una hora válida.');
        return;
    }

    const datos = {
        id: registroId,
        tipo: tipo,
        hora: hora,
        materia: materiaId
    };

    const options = {
        method: 'PUT',
        body: JSON.stringify(datos),
        headers: { 'Content-Type': 'application/json' }
    };

    fetch('http://localhost:3000/api/asistencias', options)
        .then(res => res.json())
        .then(response => {
            alert(`Registro ${registroId} actualizado correctamente.`);
            cancelarModificacion(e); 
        })
        .catch(err => {
            alert('Error al actualizar el registro.');
            console.error(err);
        });
}

function cargarAlumnosForm(e){
    e.preventDefault();

    const cursoId = document.querySelector('#cursoCarga').value;
    const listaInput = document.querySelector('#listaAlumnos').value;
    
    let listaLineas = listaInput.split('\n');
    let data = [];
    
    for(let linea of listaLineas){
        const partes = linea.trim().split(',').map(p => p.trim());
        
        if (partes.length >= 2) {
            let nombres = partes[0] || '';
            let apellidos = partes[1] || '';
            
            if (nombres && apellidos) {
                data.push({
                    nombres: nombres,
                    apellidos: apellidos,
                    curso: cursoId
                });
            }
        }
    }

    if (data.length === 0) {
        alert('No se encontraron alumnos validos para cargar. Revisa el formato: Nombre, Apellido, [DNI opcional]');
        return;
    }

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };
    
    fetch('http://localhost:3000/api/alumnos', options)
        .then(res => res.json())
        .then(response => {
            alert(`Carga exitosa: ${data.length} alumnos agregados al curso.`);
            e.target.reset(); 
            
            document.querySelector('#materias').dispatchEvent(new Event('change'));
        })
        .catch(err => {
            alert('Error al cargar alumnos.');
            console.error(err);
        });
}

document.addEventListener('DOMContentLoaded', cargarCursos);
document.querySelector('#cursos').addEventListener('change', cargarMaterias);
document.querySelector('#materias').addEventListener('change', cargarLista);
document.querySelector('#fechaBusqueda').addEventListener('change', buscarPorFecha);
document.querySelector('#formCargaAlumnos').addEventListener('submit', cargarAlumnosForm);
