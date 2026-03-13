// ===============================
// CONFIG
// ===============================

function getConfig(key) {
  const value = PropertiesService
    .getScriptProperties()
    .getProperty(key);

  if (value === null || value === undefined) {
    throw new Error('Config faltante: ' + key);
  }
  return value;
}

function getNumberConfig(key) {
  const value = getConfig(key);
  const num = Number(value);

  if (isNaN(num)) {
    throw new Error('Config no numérica: ' + key);
  }
  return num;
}

// ---- Configs concretas ----

function getSpreadsheetId() {
  return getConfig('SPREADSHEET_ID');
}

function getDriveRootFolderId() {
  return getConfig('DRIVE_ROOT_FOLDER_ID');
}

function getCoursePin() {
  return getConfig('COURSE_PIN');
}

function getMaxImagesPerUpload() {
  return getNumberConfig('MAX_IMAGES_PER_UPLOAD');
}

function getMaxUploadsPerDay() {
  return getNumberConfig('MAX_UPLOADS_PER_DAY');
}

function getMaxUploadsInDay() {
  return getNumberConfig('MAX_UPLOADS_IN_DAY');
}
