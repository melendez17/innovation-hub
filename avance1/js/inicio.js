document.addEventListener('DOMContentLoaded', async () => {
  const statIniciativas = document.getElementById('statIniciativas');
  const contenedorRecientes = document.getElementById('contenedorRecientes');

  let iniciativas = [];

  // Cargar datos
  const almacenadas = localStorage.getItem('iniciativas');
  if (almacenadas) {
    iniciativas = JSON.parse(almacenadas);
  } else {
    try {
      const res = await fetch('./datos/iniciativas.json');
      iniciativas = await res.json();
      localStorage.setItem('iniciativas', JSON.stringify(iniciativas));
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  }

  // Actualizar métrica en pantalla
  if (statIniciativas) {
    statIniciativas.textContent = iniciativas.length;
  }

  // Renderizar las últimas 3 iniciativas
  if (contenedorRecientes) {
    contenedorRecientes.innerHTML = '';

    const ultimas = iniciativas.slice(-3).reverse();

    if (ultimas.length === 0) {
      contenedorRecientes.innerHTML = `
        <div class="col-12 text-center py-4">
          <p class="text-muted">Aún no hay iniciativas registradas.</p>
        </div>
      `;
      return;
    }

    ultimas.forEach((item) => {
      let badgeColor = 'bg-primary';
      if (item.tipo === 'Necesidad') badgeColor = 'bg-warning text-dark';
      if (item.tipo === 'Reto') badgeColor = 'bg-danger';

      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = `
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge ${badgeColor}">${item.tipo}</span>
              <small class="text-muted">${item.categoria || ''}</small>
            </div>
            <h5 class="card-title fw-bold text-dark">${item.titulo}</h5>
            <p class="card-text text-secondary flex-grow-1">
              ${item.resumen || item.descripcion.substring(0, 90) + '...'}
            </p>
            <button onclick="verDetalle(${item.id})" class="btn btn-outline-primary w-100 mt-auto">
              Ver detalle
            </button>
          </div>
        </div>
      `;
      contenedorRecientes.appendChild(col);
    });
  }

  // Redirección con id
  window.verDetalle = (id) => {
    localStorage.setItem('idIniciativa', id);
    window.location.href = 'paginas/detalle.html'; // Ajusta al nombre exacto de tu archivo
  };
});