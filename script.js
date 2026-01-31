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
      showUploadForm();
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
    body: JSON.stringify({ action: 'getMaxImagesPerUpload' })
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

  loadMaterias();
}

// ===============================
// MATERIAS
// ===============================
function loadMaterias() {
  const select = document.getElementById('materia');
  select.innerHTML = '<option value="">Cargando materias...</option>';

  fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getMaterias' })
  })
  .then(res => res.json())
  .then(materias => {
    select.innerHTML = '<option value="">Selecciona materia</option>';
    materias.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      select.appendChild(opt);
    });
  })
  .catch(() => {
    select.innerHTML = '<option value="">Error cargando materias</option>';
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
