// const App = require('../DAO/app')
const Org = require('../DAO/org')
const TokenDAO = require('../DAO/token')
const { verifyPassword, getJWTTokens, refreshTokens } = require('../../utils/encrypt')
const vD = require('../../utils/validate')
const rP = require('../../utils/response')
const { dbLogger } = require('../../utils/logger')
async function login (req, res) {
  const errors = {}
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json(rP.getErrorResponse(400, 'Org login failed', {
        login: ['Must provide name and password']
      }))
    }

    const [stat, err] = vD.validateEmail(email)
    if (!stat) errors.name = err
    const [lstat, err2] = vD.validatePwd(password)
    if (!lstat) errors.password = err2

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(rP.getErrorResponse(400, 'Org login failed', errors))
    }
    const org = await Org.get(undefined, { email })
    if (!org) {
      return res.status(404).json(rP.getErrorResponse(404, 'Org not found', { lookup: [`Organization with email ${email} not found`] }))
    }
    if (!verifyPassword(password, org.password)) {
      return res.status(401).json(rP.getErrorResponse(401, 'Org login failed', { login: ['Invalid password'] }))
    }
    const tokens = getJWTTokens(org)
    res.cookie('refresh', tokens.refreshToken, { maxAge: Number(process.env.MAX_AGE), httpOnly: true, secure: true, sameSite: 'none' })
    const data = {
      tokens,
      orgId: org._id,
      email: org.email
    }
    res.status(200).json(rP.getResponse(200, 'App login successful', data))
  } catch (error) {
    dbLogger.error(error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      signup: [error.message]
    }))
  }
}

async function logout (req, res) {
  try {
    const { all } = req.body
    const refresh = req.cookies.refresh
    if (!(refresh || (refresh && all))) {
      return res.status(400).json(rP.getErrorResponse(400, 'Logout failed', {
        logout: ['Refresh token not found']
      }))
    }
    if (await TokenDAO.isBlacklisted(refresh, 'refresh')) {
      return res.status(400).json(rP.getErrorResponse(400, 'Logout failed', {
        logout: ['Token is blacklisted']
      }))
    }
    if (all) {
      await Org.reEncrypt(req.org)
    } else {
      await TokenDAO.blacklist(req.org._id, refresh, 'refresh')
      await TokenDAO.blacklist(req.org._id, req.token, 'access')
    }
    res.clearCookie('refresh')
    res.status(204).json()
  } catch (error) {
    dbLogger.error(error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      logout: [error.message]
    }))
  }
}

async function signup (req, res) {
  try {
    const orgData = req.body

    vD.validateSchema(orgData, vD.orgSchema)

    const [isValid, validationErrors] = vD.validateOrg(orgData)
    if (!isValid) {
      return res
        .status(400)
        .json(rP.getErrorResponse(400, 'Organization registration failed', validationErrors))
    }

    // Create a new app in the database
    const org = await Org.new(orgData)

    const tokens = getJWTTokens(org)
    // Prepare the response data
    const data = {
      tokens,
      orgId: org._id,
      name: org.name
    }
    res.cookie('refresh', tokens.refreshToken, { maxAge: Number(process.env.MAX_AGE), httpOnly: true, secure: true, sameSite: 'none' })
    // Return a 201 response with the registration success message and the response data
    return res
      .status(201)
      .json(rP.getResponse(201, 'New organization created', data))
  } catch (error) {
    if ([11000, 11001].includes(error.code)) {
      return res
        .status(400)
        .json(rP.getErrorResponse(400, 'Organization registration failed', {
          signup: ['Organization with that email already exists']
        }))
    } else if (error.message.startsWith('Validation failed:')) {
      return res
        .status(400)
        .json(rP.getErrorResponse(400, 'Organization registration failed', {
          signup: [error.message.split(': ')[1]]
        }))
    }

    dbLogger.error(error)

    return res
      .status(400)
      .json(rP.getErrorResponse(500, 'Internal Server Error', {
        signup: [error.message]
      }))
  }
}

async function getOrg (req, res) {
  try {
    const org = req.org.toObject()
    const { secret, __v, password, verified, vapidKeys, ...result } = org
    res.status(200).json(rP.getResponse(200, 'Organization retrieved successfully', result))
  } catch (error) {
    dbLogger.error(error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      lookup: [error.message]
    }))
  }
}

async function updateOrg (req, res) {
  try {
    const org = req.org
    const updates = req.body
    vD.validateSchema(updates, vD.orgUpdateSchema)

    const [stat, err] = vD.validateOrg(updates)
    if (!stat) {
      return res.status(400).json(rP.getErrorResponse(400, 'Organization update failed', err))
    }

    const patchedOrg = await Org.patch(org._id, updates)
    if (!patchedOrg) {
      return res.status(404).json(rP.getErrorResponse(400, 'Organization update failed', {
        update: ['Org not found']
      }))
    }
    res.status(200).json(rP.getResponse(200, 'App updated successfully', patchedOrg))
  } catch (error) {
    if ([11000, 11001].includes(error.code)) {
      return res.status(400).json(rP.getErrorResponse(400, 'Organization update failed', {
        update: ['That email is already taken. Please choose another']
      }))
    } else if (error.message.startsWith('Validation failed:')) {
      return res.status(400).json(rP.getErrorResponse(400, 'Organization update failed', {
        update: [error.message.split(': ')[1]]
      }))
    }
    dbLogger.error(error)
    res.status(400).json(rP.getErrorResponse(500, 'Internal Server Error', {
      update: [error.message]
    }))
  }
}

async function deleteOrg (req, res) {
  try {
    const org = req.org
    const deleted = await Org.delete(org._id)
    if (!deleted) {
      return res.status(404).json(rP.getErrorResponse(404, 'Organization deletion failed', {
        delete: ['Organization not found']
      }))
    }
    res.status(204).json()
  } catch (error) {
    dbLogger.error(error.message, error)
    res.status(500).json(rP.getErrorResponse(500, 'Internal Server Error', {
      delete: [error.message]
    }))
  }
}
/**
 * Refreshes the access token using the provided refresh token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the token is refreshed.
 */
async function refreshToken (req, res) {
  try {
    const refresh = req.cookies.refresh
    const tokens = await refreshTokens(refresh)
    res.cookie('refresh', tokens.refreshToken, { maxAge: Number(process.env.MAX_AGE), httpOnly: true, secure: true, sameSite: 'none' })
    res.status(200).json(rP.getResponse(200, 'Refresh token generated', tokens))
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(400, 'Error refreshing token', {
      refresh: [error.message]
    }))
  }
}

module.exports = {
  login,
  logout,
  signup,
  getOrg,
  updateOrg,
  deleteOrg,
  refreshToken
}
