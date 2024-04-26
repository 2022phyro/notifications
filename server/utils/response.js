function createResponse (status, message, data, errors) {
  return {
    status: status || 400,
    message: message || 'Something went wrong',
    data: data || {},
    errors: errors || {}
  }
}

function getErrorResponse (code, msg, errors) {
  let message = ''
  switch (code) {
    case 403:
      message = 'Forbidden'
      break
    case 404:
      message = 'Not Found'
      break
    case 401:
      message = 'Unauthorized'
      break
    default:
      message = 'Something went wrong'
      break
  }
  message = msg || message
  code = code || 400
  return createResponse(code, message, {}, errors)
}

function getResponse (code, msg, data) {
  msg = msg || 'Success'
  code = code || 200
  return createResponse(code, msg, data, {})
}

module.exports = {
  getErrorResponse,
  getResponse
}
