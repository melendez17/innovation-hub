document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formIniciativa');
  const btnAgregar = document.getElementById('btnAgregarCompetencia');
  const inputCompetencia = document.getElementById('nuevaCompetenciaInput');
  const contenedorBadges = document.getElementById('listaCompetenciasBadge');

  const competencias = [];

  // Agregar badges dinámicos
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      const valor = inputCompetencia.value.trim();
      if (valor && !competencias.includes(valor)) {
        competencias.push(valor);
        renderBadges();
        inputCompetencia.value = '';
      }
    });
  }

  function renderBadges() {
    contenedorBadges.innerHTML = '';
    competencias.forEach((comp, index) => {
      const badge = document.createElement('span');
      badge.className = 'badge bg-secondary d-flex align-items-center gap-2 p-2';
      badge.innerHTML = `${comp} <button type="button" class="btn-close btn-close-white btn-sm" onclick="eliminarCompetencia(${index})"></button>`;
      contenedorBadges.appendChild(badge);
    });
  }

  window.eliminarCompetencia = (index) => {
    competencias.splice(index, 1);
    renderBadges();
  };

  // Validación Bootstrap del formulario
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
      } else {
        alert('¡Iniciativa registrada con éxito (simulación local)!');
        window.location.href = 'catalogo.html';
      }
    });
  }
});