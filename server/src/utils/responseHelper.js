function success(res, data, statusCode = 200, message = 'OK') {
  return res.status(statusCode).json({ success: true, data, message });
}

function error(res, message = 'Error', statusCode = 400) {
  return res.status(statusCode).json({ success: false, data: null, message });
}

module.exports = { success, error };
