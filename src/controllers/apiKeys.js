const { APIKey } = require('../DAO/token')
const rP = require('../../utils/response')
const { dbLogger } = require('../../utils/logger')

async function createAPIKey (req, res) {
  try {
    const app = req.app
    const { expiry, alias, scopes } = req.body
		if (!Date.parse(expiry)) {
      return res.status(400).json(rP.getErrorResponse(400, 'Bad Request', { apikey: ['Invalid expiration date'] }))
    }
    const expDate = new Date(expiry)
		console.log(expDate)
  
    const key = await APIKey.newKey(app._id, {expires: expDate, alias, scopes})
    return res.status(200).json(rP.getResponse(200, 'API key created', key))
  } catch (error) {
    dbLogger.error(error)
    return res
      .status(500)
      .json(rP.getErrorResponse(500, 'Internal Server Error', {
        apikey: [error.message]
      }))
  }
}

async function listAPIKeys (req, res) {
  try {
    const app = req.app
    const keys = await APIKey.allKeys(app._id)
    return res.status(200).json(rP.getResponse(200, 'All api keys retrieved', keys))
  } catch (error) {
    dbLogger.error(error)
    return res
      .status(500)
      .json(rP.getErrorResponse(500, 'Internal Server Error', {
        apikey: [error.message]
      }))
  }
}

async function revokeAPIKey (req, res) {
  try {
    const app = req.app
    const { name } = req.params
    if (!name) {
      return res.status(400).json(rP.getErrorResponse(400, 'Bad Request', { apikey: ['Name is required'] }))
    }
    const result = await APIKey.revokeKey(name, app._id)
    if (!result) {
      return res.status(404).json(rP.getErrorResponse(404, 'Not Found', { apikey: ['API key not found'] }))
    }
    return res.status(200).json(rP.getResponse(200, 'API key revoked', result))
  } catch (error) {
    dbLogger.error(error)
    return res.status(500).json(rP.getErrorResponse(500, 'Internal Server Error', { apikey: [error.message] }))
  }
}

async function deleteAPIKey (req, res) {
  try {
    const { name } = req.params
    if (!name) {
      return res.status(400).json(rP.getErrorResponse(400, 'Bad Request', { apikey: ['Name is required'] }))
    }
    const result = await APIKey.deleteKey(name, req.app._id)
    if (!result) {
      return res.status(404).json(rP.getErrorResponse(404, 'Not Found', { apikey: ['API key not found'] }))
    }
    return res.status(204).json()
  } catch (error) {
    dbLogger.error(error)
    return res.status(500).json(rP.getErrorResponse(500, 'Internal Server Error', { apikey: [error.message] }))
  }
}

module.exports = {
  createAPIKey,
  listAPIKeys,
  revokeAPIKey,
  deleteAPIKey
}
