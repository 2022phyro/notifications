// Import any required modules or dependencies
const MsgService = require('../service/message')
const rP = require('../../utils/response')

async function getMessages (req, res) {
  try {
    const app = req.app
    let { page } = req.params
    let { limit, ...filters } = req.query
    page = parseInt(page) || 1
    limit = parseInt(limit) || 30

    const data = await MsgService.getMessages(app._id, page, limit, filters)
    res.status(200).json(rP.getResponse(200, 'Messages retrieved successfully', data))
  } catch (error) {
    res.status(500).json(rP.getErrorResponse(500, 'Message retrieval failed', { getMessage: [error.message] }))
  }
};

async function deleteMessage (req, res) {
  // Implement logic to delete a message
  try {
    const app = req.app
    const { id } = req.params
    const success = await MsgService.deleteMessage(app._id, id)
    if (success === 'denied') {
      return res.status(403).json(rP.getErrorResponse(403, 'Message deletion unauthorized', { deleteMessage: ["You don't have the permission to delete this message"] }))
    } else if (success === 'not found') {
      return res.status(404).json(rP.getErrorResponse(404, 'Message not found', { deleteMessage: ['The message you are trying to delete does not exist'] }))
    }
    res.status(204).json()
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Message deletion failed', { deleteMessage: [error.message] }))
  }
};

async function deleteAllMessages (req, res) {
  try {
    const app = req.app
    const filters = req.query
    await MsgService.deleteAllMessages(app._id, filters)
    res.status(204).json()
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Message deletion failed', { deleteAllMessages: [error.message] }))
  }
}

async function getMessage (req, res) {
  try {
    const app = req.app
    const { id } = req.params
    const message = await MsgService.getMessage(id, { appId: app._id })
    if (!message) {
      return res.status(404).json(rP.getErrorResponse(404, 'Message not found', { getMessage: ['The message you are trying to retrieve does not exist'] }))
    } else {
      res.status(200).json(rP.getResponse(200, 'Message retrieved successfully', message))
    }
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Message retrieval failed', { getMessage: [error.message] }))
  }
}

async function markAsRead (req, res) {
  try {
    const app = req.app
    const { id } = req.params
    const success = await MsgService.updateMessage(id, { appId: app._id }, { read: true })
    if (!success) {
      return res.status(404).json(rP.getErrorResponse(404, 'Message not found', { markRead: ['The message you are trying to update does not exist'] }))
    } else {
      res.status(200).json(rP.getResponse(200, 'Message updated successfully', success))
    }
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Message update failed', { markMessageAsRead: [error.message] }))
  }
}
// Export the controller functions
module.exports = {
  getMessages,
  getMessage,
  deleteAllMessages,
  deleteMessage,
  markAsRead
}
