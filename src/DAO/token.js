const { BLAccessToken, BLRefreshToken } = require('../models/token')
async function blacklist (token, type) {
  try {
    if (type === 'access') {
      const newAccessToken = new BLAccessToken({ token })
      await newAccessToken.save()
    } else if (type === 'refresh') {
      const newRefreshToken = new BLRefreshToken({ token })
      await newRefreshToken.save()
    } else {
      throw new Error('Invalid token type')
    }
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

async function isBlacklisted (token, type) {
  try {
    if (type === 'access') {
      const blacklistedToken = await BLAccessToken.findOne({ token })
      return !!blacklistedToken
    } else if (type === 'refresh') {
      const blacklistedToken = await BLRefreshToken.findOne({ token })
      return !!blacklistedToken
    } else {
      throw new Error('Invalid token type')
    }
  } catch (error) {
    console.error(error)
    return false
  }
}

module.exports = {
  blacklist,
  isBlacklisted
}
