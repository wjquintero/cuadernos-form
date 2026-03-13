// ===============================
// LIMITS
// ===============================

function countUploadsByTimestampToday(email) {
  const sheet = getSheet('UPLOADS');
  const rows = sheet.getDataRange().getValues().slice(1);

  const today = todayISO();
  let count = 0;

  for (const r of rows) {
    const rowEmail = r[4];
    const ts = r[5]; // timestamp

    if (!(ts instanceof Date)) continue;

    const tsDay = Utilities.formatDate(
      ts,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );

    if (rowEmail === email && tsDay === today) {
      count++;
    }
  }
  return count;
}

function countUploadsForSelectedDate(email, fechaSeleccionada) {
  const sheet = getSheet('UPLOADS');
  const rows = sheet.getDataRange().getValues().slice(1);

  let count = 0;

  for (const r of rows) {
    const rowEmail = r[4];
    const rowFecha = r[1]; // fecha del form

    const sheetFecha = rowFecha instanceof Date
      ? Utilities.formatDate(
          rowFecha,
          Session.getScriptTimeZone(),
          'yyyy-MM-dd'
        )
      : String(rowFecha);

    if (rowEmail === email && sheetFecha === fechaSeleccionada) {
      count++;
    }
  }
  return count;
}


function validateUploadLimits(email, fecha, imagesCount) {
  // Máx imágenes por subida
  if (imagesCount > getMaxImagesPerUpload()) {
    throw new Error(
      `Máximo ${getMaxImagesPerUpload()} imágenes por subida`
    );
  }

  // Máx subidas por día real (timestamp)
  const usedToday = countUploadsByTimestampToday(email);
  if (usedToday >= getMaxUploadsPerDay()) {
    throw new Error(
      `Límite diario alcanzado (${getMaxUploadsPerDay()} subidas hoy)`
    );
  }

  // Máx subidas para una misma fecha de clase
  const usedForDate = countUploadsForSelectedDate(email, fecha);
  if (usedForDate >= getMaxUploadsInDay()) {
    throw new Error(
      `Límite alcanzado para la fecha ${fecha} (${getMaxUploadsInDay()} subidas)`
    );
  }
}

