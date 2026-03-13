let user = null;
let selectedFiles = [];
let MAX_IMAGES = 4; // valor por defecto, se actualizará desde backend

const WORKER_URL = 'https://cuadernos-proxy.williamqq.workers.dev/';

// ===============================
// LOGIN
// ===============================
function loginUser() {
  const emailVal = document.getElementById('email').value.trim();
  const pinVal = document.getElementById('pin').value.trim();
  const status = document.getElementById('loginStatus');

  if (!emailVal || !pinVal) {
    status.textContent = '❌ Completa ambos campos';
    return;
  }

  status.textContent = '⏳ Verificando...';

  fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email: emailVal, pin: pinVal })
  })
  .then(res => res.json())
  .then(res => {
    if(res.success) {
      user = res;
      fetchMaxImages();
      showMenu();
    } else {
      status.textContent = '❌ ' + res.error;
    }
  })
  .catch(() => status.textContent = '❌ Error técnico');
}

// ===============================
// FETCH MAX_IMAGES
// ===============================
function fetchMaxImages() {
  fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getMaxImagesInUpload' })
  })
  .then(res => res.json())
  .then(res => {
    if (res.success && res.value) {
      MAX_IMAGES = res.value;
    }
  })
  .catch(console.error);
}

// ===============================
// MOSTRAR FORM
// ===============================
function showUploadForm() {
  document.getElementById('headerEmail').textContent = user.email;
  document.getElementById('headerStudent').textContent = user.studentName;
  document.getElementById('headerParent').textContent = user.parentName || '–';

  const today = new Date();
  document.getElementById('headerDate').textContent = today.toLocaleDateString('es-ES', {
    day:'2-digit', month:'2-digit', year:'numeric'
  });

  document.getElementById('fecha').value = today.toISOString().split('T')[0];
  document.getElementById('loginDate').textContent = today.toLocaleDateString('es-ES');

  document.getElementById('loginDiv').style.display = 'none';
  document.getElementById('uploadDiv').style.display = 'block';

  loadMateriasIntoSelect('materia', 'Selecciona materia');
}

// ===============================
// MATERIAS
// ===============================
function loadMateriasIntoSelect(selectId, firstOptionText) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">${firstOptionText}</option>`;

  fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getMaterias' })
  })
  .then(res => res.json())
  .then(materias => {
    select.innerHTML = `<option value="">${firstOptionText}</option>`;
    materias.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      select.appendChild(opt);
    });
  })
  .catch(() => {
    select.innerHTML = `<option value="">Error cargando materias</option>`;
  });
}

// ===============================
// PREVIEW IMÁGENES
// ===============================
const filesInput = document.getElementById('files');
filesInput.addEventListener('change', e => {
  const filesArr = Array.from(e.target.files);
  for (const file of filesArr) {
    if (!file.type.startsWith('image/')) continue;
    if (selectedFiles.length >= MAX_IMAGES) break;
    selectedFiles.push(file);
  }
  renderPreview();
  e.target.value = '';
});

function renderPreview() {
  const preview = document.getElementById('preview');
  preview.innerHTML = '';
  selectedFiles.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = () => {
      preview.innerHTML += `
        <div class="preview-wrapper">
          <img src="${reader.result}" class="preview-img">
          <button class="remove-btn" onclick="removeImg(${i})">×</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  });
}

function removeImg(i) {
  selectedFiles.splice(i, 1);
  renderPreview();
}

// ===============================
// SUBIR FORM
// ===============================
function submitForm() {
  const status = document.getElementById('status');
  status.textContent = '⏳ Subiendo...';

  const fecha = document.getElementById('fecha').value;
  const materia = document.getElementById('materia').value;

  if (!fecha || !materia) {
    status.textContent = '❌ Completa todos los campos';
    return;
  }

  if (selectedFiles.length === 0) {
    status.textContent = '❌ Selecciona al menos una imagen';
    return;
  }

  if (selectedFiles.length > MAX_IMAGES) {
    status.textContent = `❌ Máximo ${MAX_IMAGES} imágenes`;
    return;
  }

  Promise.all(selectedFiles.map(fileToBase64))
    .then(images => {
      const payload = {
        email: user.email,
        studentName: user.studentName,
        fecha,
        materia,
        images
      };

      fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'uploadCuadernos', payload })
      })
      .then(res => res.json())
      .then(res => {
        if(res.success) {
          status.textContent = '✅ ' + res.message;
          selectedFiles = [];
          renderPreview();
        } else {
          status.textContent = '❌ ' + res.error;
        }
      })
      .catch(() => status.textContent = '❌ Error técnico');
    });
}

// ===============================
// MOSTRAR CONSULTA
// ===============================
function showConsultaForm() {
  // Header
  document.getElementById('consultaHeaderEmail').textContent = user.email;
  document.getElementById('consultaHeaderStudent').textContent = user.studentName;
  document.getElementById('consultaHeaderParent').textContent = user.parentName || '–';

  const today = new Date();

  document.getElementById('consultaHeaderDate').textContent =
    today.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  // Fecha por defecto
  document.getElementById('consultaFecha').value =
    today.toISOString().split('T')[0];

  // Navegación
  document.getElementById('menuDiv').style.display = 'none';
  document.getElementById('consultaDiv').style.display = 'block';

  // Materias
  loadMateriasIntoSelect('consultaMateria', 'Todas las materias');
  
  // 🔑 VALIDACIÓN FINAL
  validateConsultaFilters();
}

document.addEventListener('DOMContentLoaded', () => {
  const fechaInput = document.getElementById('consultaFecha');
  const materiaSelect = document.getElementById('consultaMateria');

  if (fechaInput) {
    fechaInput.addEventListener('change', validateConsultaFilters);
  }

  if (materiaSelect) {
    materiaSelect.addEventListener('change', validateConsultaFilters);
  }
});

// ===============================
// BUSCAR CUADERNOS
// ===============================
function buscarCuadernos() {
  const fecha = document.getElementById('consultaFecha').value;
  const materia = document.getElementById('consultaMateria').value;
  const status = document.getElementById('consultaStatus');
  const resultsDiv = document.getElementById('consultaResults');

  if (!fecha) {
    status.textContent = '❌ La fecha es obligatoria';
    return;
  }

  status.textContent = '⏳ Buscando...';
  resultsDiv.innerHTML = '';

  fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getCuadernos',
      payload: {
        email: user.email,   // para validar whitelist
        fecha,
        materia
      }
    })
  })
  .then(res => res.json())
  .then(res => {
    if(res.success) {
      if(res.items.length === 0) {
        status.textContent = '⚠️ No se encontraron resultados';
      } else {
        status.textContent = '';
        renderConsultaResults(res.items);
      }
    } else {
      status.textContent = '❌ ' + res.error;
    }
  })
  .catch(() => status.textContent = '❌ Error técnico');
}

function renderConsultaResults(items) {
  const resultsDiv = document.getElementById('consultaResults');
  resultsDiv.innerHTML = '';

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card mb-2 p-2';

    div.innerHTML = `
      <div><strong>Fecha:</strong> ${item.fecha}</div>
      <div><strong>Materia:</strong> ${item.materia}</div>
      <div><strong>Estudiante:</strong> ${item.studentName}</div>
      <div><strong>Imágenes:</strong> ${item.imageCount}</div>
      <div class="mt-2 text-end">
        <button class="btn btn-sm btn-outline-primary" onclick="verDetalleCuaderno('${item.uploadId}')">
          Ver detalle
        </button>
      </div>
    `;
    resultsDiv.appendChild(div);
  });
}

// ===============================
// DETALLE CUADERNO
// ===============================
function verDetalleCuaderno(uploadId) {
  const infoDiv = document.getElementById('detalleInfo');
  const imagesDiv = document.getElementById('detalleImages');

  infoDiv.textContent = '⏳ Cargando...';
  imagesDiv.innerHTML = '';

  document.getElementById('consultaDiv').style.display = 'none';
  document.getElementById('detalleDiv').style.display = 'block';

  fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getUploadDetail',
      payload: { email: user.email, uploadId }
    })
  })
  .then(res => res.json())
  .then(res => {
    if (res.success) {
      renderDetalle(res.metadata, res.images);
    } else {
      infoDiv.textContent = '❌ ' + res.error;
    }
  })
  .catch(() => infoDiv.textContent = '❌ Error técnico');
}

function renderDetalle(metadata, images) {
  const infoDiv = document.getElementById('detalleInfo');
  const imagesDiv = document.getElementById('detalleImages');

  infoDiv.innerHTML = `
    <div><strong>📅 Fecha:</strong> ${metadata.fecha}</div>
    <div><strong>📚 Materia:</strong> ${metadata.materia}</div>
    <div><strong>👦 Estudiante:</strong> ${metadata.studentName}</div>
    <div><strong>🖼️ Imágenes:</strong> ${images.length}</div>
  `;

  imagesDiv.innerHTML = '';
  images.forEach(img => {
    const link = document.createElement('a');
    link.href = img.url;
    link.target = '_blank';
    const imgEl = document.createElement('img');
    imgEl.src = img.url;
    imgEl.className = 'detalle-img';
    imgEl.alt = 'Página ' + img.pageNumber;
    link.appendChild(imgEl);
    imagesDiv.appendChild(link);
  });
}

function volverAConsulta() {
  document.getElementById('detalleDiv').style.display = 'none';
  document.getElementById('consultaDiv').style.display = 'block';
}



function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve({ name:file.name, mimeType:file.type, base64 });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showMenu() {
  document.getElementById('loginDiv').style.display = 'none';
  document.getElementById('menuDiv').style.display = 'block';
}

function goToUpload() {
  document.getElementById('menuDiv').style.display = 'none';
  showUploadForm();
}

function goToConsulta() {
  document.getElementById('menuDiv').style.display = 'none';
  showConsultaForm();
}

function validateConsultaFilters() {
  const fecha = document.getElementById('consultaFecha').value;
  const btn = document.getElementById('consultaBuscarBtn');

  btn.disabled = !fecha;
}
