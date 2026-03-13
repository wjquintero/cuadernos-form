function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (!data.action) {
      throw new Error('Action requerida');
    }

    switch (data.action) {

      case 'login':
        return json(authLogin(data.email, data.pin));

      case 'getMaterias':
        return json(getMaterias());

      case 'getMaxImagesPerUpload':
        return json(getMaxImagesInUpload());

      case 'uploadCuadernos':
        return json(uploadCuadernosService(data.payload));

      case 'getCuadernos':
        return json(getCuadernosService(data.payload));
  

      default:
        throw new Error('Action no válida');
    }

  } catch (err) {
    return json({ success: false, error: err.message });
  }
}


function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


