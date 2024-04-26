class GRPCError extends Error {
  constructor (code, details) {
    super(details)
    this.code = code
    this.details = details
  }
}

module.exports = {
  GRPCError
}
