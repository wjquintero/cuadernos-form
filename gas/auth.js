// ===============================
// AUTH / SECURITY
// ===============================

function normalizeEmail(email) {
  return String(email || '').toLowerCase().trim();
}

function findWhitelistEntry(email) {
  const sheet = getSheet('WHITELIST');
  const rows = sheet.getDataRange().getValues().slice(1);

  const normalized = normalizeEmail(email);

  for (const r of rows) {
    const rowEmail = normalizeEmail(r[2]);
    if (rowEmail === normalized) {
      return {
        studentName: r[0],
        parentName: r[1],
        email: r[2],
        active: r[3] === true
      };
    }
  }
  return null;
}

function isValidPin(pin) {
  return typeof pin === 'string' && pin === getCoursePin();
}
