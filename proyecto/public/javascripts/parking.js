/**
 * PARKING EN TIEMPO REAL - Frontend JS
 * Carga las plazas de parking y las muestra como cards con su estado actual.
 */

document.addEventListener('DOMContentLoaded', () => {
  loadParkingSpots();

  // Recargar cada 30 segundos para mantener datos en tiempo real
  setInterval(loadParkingSpots, 30000);
});

/**
 * Carga las plazas de parking desde la API
 */
async function loadParkingSpots() {
  try {
    const response = await fetch('/api/parking/spots');
    if (!response.ok) throw new Error('Error al cargar las plazas');

    const data = await response.json();
    renderParkingGrid(data.spots);
    updateStats(data.stats);
  } catch (error) {
    console.error('Error cargando plazas de parking:', error);
    document.getElementById('parking-grid').innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-exclamation-triangle text-warning fs-1"></i>
        <p class="text-muted mt-2">Error al cargar las plazas de parking</p>
      </div>
    `;
  }
}

/**
 * Renderiza el grid de plazas de parking agrupadas por fila (A, B, C...)
 */
function renderParkingGrid(spots) {
  const grid = document.getElementById('parking-grid');
  grid.innerHTML = '';

  if (!spots || spots.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-inbox text-muted fs-1"></i>
        <p class="text-muted mt-2">No hay plazas de parking configuradas</p>
      </div>
    `;
    return;
  }

  // Agrupar plazas por fila (letra antes del guión: A-001 → A)
  const groups = {};
  spots.forEach(spot => {
    const row = spot.cod_parking_spot.split('-')[0] || 'Otros';
    if (!groups[row]) groups[row] = [];
    groups[row].push(spot);
  });

  // Renderizar cada grupo con su cabecera
  Object.keys(groups).sort().forEach(rowLetter => {
    const section = document.createElement('div');
    section.className = 'col-12 parking-section';

    // Cabecera de fila
    const header = document.createElement('div');
    header.className = 'parking-row-header';
    header.innerHTML = `
      <span class="parking-row-letter">Fila ${rowLetter}</span>
      <span class="parking-row-count">${groups[rowLetter].length} plazas</span>
    `;
    section.appendChild(header);

    // Grid de plazas dentro de la fila
    const rowGrid = document.createElement('div');
    rowGrid.className = 'row g-3 mb-2';

    groups[rowLetter].forEach(spot => {
      const card = createSpotCard(spot);
      rowGrid.appendChild(card);
    });

    section.appendChild(rowGrid);
    grid.appendChild(section);
  });
}

/**
 * Crea un card de plaza según su estado
 */
function createSpotCard(spot) {
  let templateId;
  let status = spot.status || 'LIBRE';

  // Determinar qué template usar
  if (!spot.is_available) {
    templateId = 'spot-template-nodisponible';
    status = 'NO_DISPONIBLE';
  } else if (spot.reservation_status === 'EN CURSO') {
    templateId = 'spot-template-ocupado';
  } else if (spot.reservation_status === 'CONFIRMADA' || spot.reservation_status === 'PENDIENTE') {
    templateId = 'spot-template-reservado';
  } else {
    templateId = 'spot-template-libre';
  }

  const template = document.getElementById(templateId);
  const clone = template.content.cloneNode(true);

  // Datos comunes
  clone.querySelector('.parking-card-code').textContent = spot.cod_parking_spot;
  clone.querySelector('.parking-card-type').textContent = spot.type || 'STANDARD';

  // Guardar datos en el elemento
  const col = clone.querySelector('.spot-col');

  // Datos específicos según estado
  if (templateId === 'spot-template-ocupado') {
    clone.querySelector('.customer-name').textContent = spot.customer_name || '-';
    clone.querySelector('.plate-text').textContent = spot.license_plate || '-';
    clone.querySelector('.entry-date').textContent = formatDate(spot.entry_date);
    clone.querySelector('.exit-date').textContent = spot.exit_date ? formatDate(spot.exit_date) : 'Sin definir';
  } else if (templateId === 'spot-template-reservado') {
    clone.querySelector('.customer-name').textContent = spot.customer_name || '-';
    clone.querySelector('.arrival-date').textContent = formatDate(spot.entry_date);
  }

  return clone;
}

/**
 * Actualiza los stats de la barra superior
 */
function updateStats(stats) {
  if (!stats) return;

  const total = stats.total || 0;
  const ocupadas = stats.en_curso || 0;
  const reservadas = stats.reservadas || 0;
  const libres = stats.libres || 0;
  const porcentaje = total > 0 ? Math.round((ocupadas / total) * 100) : 0;

  document.getElementById('stat-ocupacion').textContent = porcentaje + '%';
  document.getElementById('stat-detail').textContent = `${ocupadas} Ocup. · ${libres} Libres`;
  document.getElementById('stat-total-spots').textContent = total;
  document.getElementById('stat-reservadas').textContent = reservadas;
  document.getElementById('stat-encurso').textContent = ocupadas;
}

/**
 * Formatea una fecha ISO a formato legible
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
