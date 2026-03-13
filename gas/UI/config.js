// ===============================
// UI FUNCTIONS
// ===============================

/**
 * Devuelve la lista de materias desde CONFIGS columna A (ignora la fila 1)
 */
function getMaterias() {
  try {
    const sheet = getSheet('CONFIGS'); 
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    return values.flat().filter(v => v);
  } catch (err) {
    Logger.log('Error getMaterias: ' + err.message);
    return [];
  }
}

/**
 * Devuelve el máximo de imágenes por subida
 */
function getMaxImagesInUpload() {
  try {
    const value = getMaxImagesPerUpload();
    return { success: true, value: value || 4 }; // fallback 4
  } catch (err) {
    Logger.log('Error getMaxImagesInUpload: ' + err.message);
    return { success: false, error: err.message };
  }
}
