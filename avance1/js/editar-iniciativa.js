document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formEditarIniciativa');
  const btnAgregar = document.getElementById('btnAgregarCompetencia');
  const inputCompetencia = document.getElementById('nuevaCompetenciaInput');
  const contenedorBadges = document.getElementById('listaCompetenciasBadge');
  const resumenTextarea = document.getElementById('resumen');
  const contadorResumen = document.getElementById('contadorResumen');

  let iniciativas = [];
  let iniciativaActual = null;
  let competencias = [];

  // Obtener el ID activo de localStorage
  const idIniciativa = localStorage.getItem('idIniciativa') || localStorage.getItem('idIniciativaEditar');

  // 1. Cargar la Iniciativa en el Formulario
  function cargarIniciativa() {
    const almacenadas = localStorage.getItem('iniciativas');
    
    if (!almacenadas) {
      alert('No hay iniciativas registradas.');
      window.location.href = 'catalogo.html';
      return;
    }

    iniciativas = JSON.parse(almacenadas);
    iniciativaActual = iniciativas.find(i => i.id == idIniciativa);

    if (!iniciativaActual) {
      alert('No se encontró la iniciativa que deseas editar.');
      window.location.href = 'catalogo.html';
      return;
    }

    // Llenar inputs con los datos del objeto
    document.getElementById('titulo').value = iniciativaActual.titulo || '';
    document.getElementById('tipo').value = iniciativaActual.tipo || '';
    document.getElementById('categoria').value = iniciativaActual.categoria || '';
    document.getElementById('visibilidad').value = iniciativaActual.visibilidad || '';
    document.getElementById('resumen').value = iniciativaActual.resumen || '';
    document.getElementById('descripcion').value = iniciativaActual.descripcion || '';
    document.getElementById('objetivos').value = iniciativaActual.objetivos || '';
    document.getElementById('requiereParticipantes').checked = iniciativaActual.requiereParticipantes || false;

    // Cargar Competencias
    competencias = iniciativaActual.competencias || iniciativaActual.competenciasRequeridas || [];
    renderBadges();

    // Actualizar contador de caracteres
    if (resumenTextarea && contadorResumen) {
      contadorResumen.textContent = `${resumenTextarea.value.length} / 150`;
    }
  }

  // Contador en tiempo real para el resumen
  if (resumenTextarea && contadorResumen) {
    resumenTextarea.addEventListener('input', () => {
      contadorResumen.textContent = `${resumenTextarea.value.length} / 150`;
    });
  }

  // 2. Manejo de Competencias Dinámicas
  if (btnAgregar && inputCompetencia) {
    btnAgregar.addEventListener('click', agregarCompetencia);
    inputCompetencia.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        agregarCompetencia();
      }
    });
  }

  function agregarCompetencia() {
    const valor = inputCompetencia.value.trim();
    if (valor !== '' && !competencias.includes(valor)) {
      competencias.push(valor);
      renderBadges();
      inputCompetencia.value = '';
    }
  }

  function renderBadges() {
    contenedorBadges.innerHTML = '';
    competencias.forEach((comp, index) => {
      const badge = document.createElement('span');
      badge.className = 'badge bg-primary d-inline-flex align-items-center gap-2 p-2 fs-6';
      badge.innerHTML = `
        ${comp}
        <i class="fa-solid fa-xmark" style="cursor: pointer;" onclick="eliminarCompetencia(${index})"></i>
      `;
      contenedorBadges.appendChild(badge);
    });
  }

  window.eliminarCompetencia = (index) => {
    competencias.splice(index, 1);
    renderBadges();
  };

  // 3. Guardar Cambios Actualizados
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      // Buscar el índice del elemento en la lista global
      const index = iniciativas.findIndex(i => i.id == idIniciativa);

      if (index !== -1) {
        // Reemplazar campos manteniendo los originales que no cambiaron (como la fecha de creación)
        iniciativas[index] = {
          ...iniciativas[index],
          titulo: document.getElementById('titulo').value.trim(),
          tipo: document.getElementById('tipo').value,
          categoria: document.getElementById('categoria').value,
          visibilidad: document.getElementById('visibilidad').value,
          resumen: document.getElementById('resumen').value.trim(),
          descripcion: document.getElementById('descripcion').value.trim(),
          objetivos: document.getElementById('objetivos').value.trim(),
          requiereParticipantes: document.getElementById('requiereParticipantes').checked,
          competencias: [...competencias],
          competenciasRequeridas: [...competencias]
        };

        // Guardar actualización en localStorage
        localStorage.setItem('iniciativas', JSON.stringify(iniciativas));
        
        alert('¡Iniciativa actualizada con éxito!');
        window.location.href = 'catalogo.html';
      }
    });
  }

  // Inicializar la carga de datos
  cargarIniciativa();
});