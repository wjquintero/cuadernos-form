// ===============================
// UPLOADS
// ===============================

function uploadCuadernosService(payload) {
  try {
    log('LOG', 'uploadCuadernos start');

    if (!payload) {
      throw new Error('Payload vacío');
    }

    const {
      email,
      fecha,
      materia,
      studentName,
      images
    } = payload;

    if (!email || !fecha || !materia || !studentName) {
      throw new Error('Faltan datos obligatorios');
    }

    if (!images || images.length === 0) {
      throw new Error('No se recibieron imágenes');
    }

    // --- AUTH ---
    const whitelistEntry = findWhitelistEntry(email);
    if (!whitelistEntry) throw new Error('Email no autorizado');
    if (!whitelistEntry.active) throw new Error('Usuario desactivado');

    // --- LIMITS ---
    validateUploadLimits(email, fecha, images.length);

    // --- DRIVE ---
    const uploadId = generateUploadId();
    const savedFiles = saveImagesToDrive(fecha, images);

    // --- SHEETS ---
    saveUploadMetadata({
      uploadId,
      fecha,
      materia,
      studentName,
      email
    });

    saveUploadFiles(uploadId, savedFiles);

    log('LOG', `Upload ${uploadId} OK (${savedFiles.length} imágenes)`);

    return {
      success: true,
      message: `Se subieron ${savedFiles.length} imágenes`
    };

  } catch (err) {
    log('ERROR', err.message);
    return { success: false, error: err.message };
  }
}

function generateUploadId() {
  return 'UPL-' + new Date().getTime();
}

function saveUploadMetadata(upload) {
  const sheet = getSheet('UPLOADS');

  sheet.appendRow([
    upload.uploadId,
    upload.fecha,
    upload.materia,
    upload.studentName,
    upload.email,
    new Date()
  ]);
}

function saveUploadFiles(uploadId, files) {
  const sheet = getSheet('UPLOADS_FILES');

  files.forEach(f => {
    sheet.appendRow([
      uploadId,
      f.driveFileId,
      f.pageNumber
    ]);
  });
}
