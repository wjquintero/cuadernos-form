// ===============================
// BASE
// ===============================

function getSpreadsheet() {
  return SpreadsheetApp.openById(getSpreadsheetId());
}

function getSheet(name) {
  const sheet = getSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw new Error('No existe la hoja: ' + name);
  }
  return sheet;
}

function todayISO() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}

function log(type, message) {
  try {
    getSheet('LOGS').appendRow([new Date(), type, message]);
  } catch (e) {
    // logging nunca debe romper el flujo
    Logger.log(type + ': ' + message);
  }
}
