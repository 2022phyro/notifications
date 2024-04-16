// Import any required modules or dependencies
const Message = require('../DAO/message')
const rP = require('../../utils/response')
const { scheduleMessage } = require('./queue')
const channelPromise = require('../../config/rabbitmq')
async function getMessages (req, res) {
  try {
    const app = req.app
    let { page, limit, read, status, userId, retries} = req.query
    page = parseInt(page) || 1
    limit = parseInt(limit) || 30
		const filters = { read, userId, status, retries }
		Object.keys(filters).forEach(key => {
			if (filters[key] === undefined) {
				delete filters[key]
			}
		})
    const data = await Message.getMessages(app._id, page, limit, filters)
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
    const success = await Message.deleteMessage(app._id, id)
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
    await Message.deleteAllMessages(app._id, filters)
    res.status(204).json()
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Message deletion failed', { deleteAllMessages: [error.message] }))
  }
}

async function getMessage (req, res) {
  try {
    const app = req.app
    const { id } = req.params
    const message = await Message.getMessage(id, { appId: app._id })
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
    const success = await Message.updateMessage(id, { read: true }, { appId: app._id })
    delete success.value
    delete success.__v
    if (!success) {
      return res.status(404).json(rP.getErrorResponse(404, 'Message not found', { markRead: ['The message you are trying to update does not exist'] }))
    } else {
      res.status(200).json(rP.getResponse(200, 'Message updated successfully', success))
    }
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(500, 'Message update failed', { markMessageAsRead: [error.message] }))
  }
}

async function newMessage (req, res) {
  try {
    const { userId, ...notification } = req.body
    const message = {
      payload: { userId, appId: req.app._id },
      notification
    }
    const { channel } = await channelPromise
    const success = await scheduleMessage(channel, JSON.stringify(message))
    const { value, __v, ...newMessage } = success.toObject()
    res.status(201).json(rP.getResponse(201, 'Notification sent successfully', newMessage))
  } catch (error) {
    res.status(400).json(rP.getErrorResponse(400, 'Message creation failed', { newMessage: [error.message] }))
  }
}
module.exports = {
  getMessages,
  getMessage,
  deleteAllMessages,
  deleteMessage,
  markAsRead,
  newMessage
}
