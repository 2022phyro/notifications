class ValidationError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ValidationError'
  }
}

class GRPCError extends Error {
  constructor (message, code, details) {
    super(message)
    this.name = 'GRPCError'
    this.code = code
    this.details = details
  }
}

class ServiceError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ServiceError'
  }
}
module.exports = {
  ServiceError,
  GRPCError,
  ValidationError
}
