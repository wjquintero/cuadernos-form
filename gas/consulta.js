// ===============================
// CONSULTA
// ===============================

function getCuadernosService(payload) {
  try {
    if (!payload) throw new Error('Payload vacío');

    const { email, fecha, materia } = payload;
    if (!email || !fecha) throw new Error('Datos obligatorios faltantes');

    // --- AUTH: solo validamos que el usuario exista y esté activo ---
    const whitelistEntry = findWhitelistEntry(email);
    if (!whitelistEntry || !whitelistEntry.active) {
      throw new Error('No autorizado');
    }

    const uploadsSheet = getSheet('UPLOADS');
    const filesSheet = getSheet('UPLOADS_FILES');

    const uploads = uploadsSheet.getDataRange().getValues().slice(1);
    const files = filesSheet.getDataRange().getValues().slice(1);

    // --- Mapa uploadId -> cantidad de imágenes ---
    const fileCountMap = {};
    files.forEach(r => {
      const uploadId = r[0];
      fileCountMap[uploadId] = (fileCountMap[uploadId] || 0) + 1;
    });

    // --- Helper para formatear fecha ---
    const formatDate = (d) => {
      if (d instanceof Date) {
        return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      return String(d);
    };

    // --- Filtrar uploads por fecha y materia únicamente ---
    const result = [];

    uploads.forEach(r => {
      const [
        uploadId,
        uploadFechaRaw,
        uploadMateria,
        studentName,
        uploadEmail,
        createdAt
      ] = r;

      const uploadFecha = formatDate(uploadFechaRaw);

      if (uploadFecha !== fecha) return;
      if (materia && uploadMateria !== materia) return;

      result.push({
        uploadId,
        fecha: uploadFecha,
        materia: uploadMateria,
        studentName,
        email: uploadEmail,          // se mantiene para mostrar de quién es
        imageCount: fileCountMap[uploadId] || 0,
        createdAt
      });
    });

    return {
      success: true,
      items: result
    };

  } catch (err) {
    return { success: false, error: err.message };
  }
}
