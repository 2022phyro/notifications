/**
 *
 */
const Message = require('../models/message')

function MessageModel (appId, body, notifiLimit, recipents, maxRecipents, many = false, received = false) {
  this.appId = appId
  this.body = body
  this.notifiLimit = notifiLimit
  this.maxRecipents = maxRecipents
  this.recipents = recipents
  this.many = many
  this.received = received
}

MessageModel.createMessage = async function (messageData) {
  try {
    if (!messageData.appId) {
      throw new Error('Message id must be provided')
    }
    const message = new Message(messageData)
    const result = await message.save()
    return result
  } catch (error) {
    console.error('Error creating a new message', error)
  }
}
MessageModel.getMessage = async function (messageId, filters) {
  let message
  try {
    if (messageId) {
      message = await Message.findById(messageId)
    } else {
      message = Message
    }
    if (filters) {
      message = await message.findOne(filters)
    }
    const result = await message.lean().exec()
    return result
  } catch (error) {
    console.error('Error while fetching Message', error)
    throw new Error('Error while fetching Message')
  }
}
MessageModel.getMessages = async function (filters) {
  try {
    const messages = await Message.find(filters).lean().exec()
    return messages
  } catch (error) {
    console.error('Error while fetching messages', error)
    throw new Error('Error while fetching messages')
  }
}
MessageModel.updateMessage = async function (messageId, messageData) {
  try {
    const updatedApp = await Message.findByIdAndUpdate(messageId, messageData).lean().exec()
    return updatedApp
  } catch (error) {
    console.error('Error while updating message', error)
    throw new Error('Error while updating message')
  }
}

MessageModel.deleteMessage = async function (messageId) {
  try {
    const deletedApp = await Message.findByIdAndDelete(messageId).lean().exec()
    return deletedApp
  } catch (error) {
    console.error('Error while deleting message', error)
    throw new Error('Error while deleting message')
  }
}

module.exports = MessageModel
