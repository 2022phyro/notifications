const bcrypt = require('bcryptjs')

function encryptPassword (password, saltRounds = 10) {
  try {
    const salt = bcrypt.genSaltSync(saltRounds)
    return bcrypt.hashSync(password, salt)
  } catch {
    throw new Error('Error while encrypting password')
  }
}

function generateSecret (length = 16) {
  return bcrypt.hashSync(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), 10).substring(0, length)
}

module.exports = {
  encryptPassword,
  generateSecret
}
