// ===============================
// AUTH UI FUNCTIONS
// ===============================

/**
 * Verifica email + pin, retorna info del alumno si está autorizado
 */
function authLogin(email, pin) {
  try {
    const whitelistEntry = findWhitelistEntry(email);

    if (!whitelistEntry) return { success: false, error: 'Email no autorizado' };
    if (!whitelistEntry.active) return { success: false, error: 'Usuario desactivado' };
    if (!isValidPin(pin)) return { success: false, error: 'PIN incorrecto' };

    return {
      success: true,
      email: whitelistEntry.email,
      studentName: whitelistEntry.studentName,
      parentName: whitelistEntry.parentName || ''
    };
  } catch(err) {
    return { success: false, error: 'Error técnico: ' + err.message };
  }
}

