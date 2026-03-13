// ===============================
// DRIVE
// ===============================

function getRootFolder() {
  return DriveApp.getFolderById(getDriveRootFolderId());
}

function getOrCreateMonthFolder(fecha) {
  const root = getRootFolder();

  const month = Utilities.formatDate(
    new Date(fecha),
    Session.getScriptTimeZone(),
    'yyyy-MM'
  );

  const folders = root.getFoldersByName(month);
  if (folders.hasNext()) {
    return folders.next();
  }
  return root.createFolder(month);
}

function saveImagesToDrive(fecha, images) {
  const folder = getOrCreateMonthFolder(fecha);
  const savedFiles = [];

  images.forEach((img, index) => {
    const bytes = Utilities.base64Decode(img.base64);
    const blob = Utilities.newBlob(bytes, img.mimeType, img.name);
    const file = folder.createFile(blob);

    savedFiles.push({
      driveFileId: file.getId(),
      pageNumber: index + 1
    });
  });

  return savedFiles;
}
