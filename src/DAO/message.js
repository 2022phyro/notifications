/**
 * @file DAO/message.js
 * @description - This file contains the MessageModel class for handling database operations.
 *              - It alows us to manipulate the database and Message models
 * @requires 'mongoose' - for database operations.
 * @requires '../models/message' - for the Message schema.
 * @exports MessageModel - as a class for handling database operations.
 */
const Message = require('../models/message')

/**
 * Represents a MessageModel.
 *
 * @class
 * @classdesc A class that represents a MessageModel.
 */
function MessageModel (appId, body, notifiLimit, recipents, maxRecipents, many = false, received = false) {
  this.appId = appId
  this.body = body
  this.notifiLimit = notifiLimit
  this.maxRecipents = maxRecipents
  this.recipents = recipents
  this.many = many
  this.received = received
}
/**
 * Creates a new message and saves it to the database.
 *
 * @param {Object} messageData - The data for the new message.
 * @param {string} messageData.appId - The ID of the message.
 * @param {string} messageData.body - The body of the message.
 * @param {number} messageData.notifiLimit - The notification limit for the message.
 * @param {Array} messageData.recipents - The recipients of the message.
 * @param {number} messageData.maxRecipents - The maximum number of recipients for the message.
 * @param {boolean} [messageData.many=false] - Indicates if the message can have multiple recipients.
 * @param {boolean} [messageData.received=false] - Indicates if the message has been received.
 * @returns {Promise} A promise that resolves with the saved message object.
 * @throws {Error} If the message ID is not provided.
 * @throws {Error} If there is an error saving the message.
 */
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

/**
 * Retrieves a message by its ID and optional filters.
 *
 * @param {string} messageId - The ID of the message to retrieve.
 * @param {object} filters - Optional filters to apply when retrieving the message.
 * @returns {Promise<object>} - A promise that resolves to the retrieved message.
 * @throws {Error} - If there is an error while fetching the message.
 */
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

/**
 * Retrieves messages based on the provided filters.
 *
 * @param {Object} filters - The filters to apply when retrieving messages.
 * @returns {Promise<Array>} - A promise that resolves to an array of messages.
 * @throws {Error} - If there is an error while fetching messages.
 */
MessageModel.getMessages = async function (filters) {
  try {
    const messages = await Message.find(filters).lean().exec()
    return messages
  } catch (error) {
    console.error('Error while fetching messages', error)
    throw new Error('Error while fetching messages')
  }
}

/**
 * Updates a message with the given messageId and messageData.
 *
 * @param {string} messageId - The ID of the message to be updated.
 * @param {object} messageData - The updated data for the message.
 * @returns {Promise<object>} - The updated message object.
 * @throws {Error} - If there is an error while updating the message.
 */
MessageModel.updateMessage = async function (messageId, filters, messageData) {
  try {
    if (messageId) {
      const updatedApp = await Message.findByIdAndUpdate(messageId, messageData).lean().exec()
      return updatedApp
    } else if (filters) {
      const updatedApps = await Message.updateMany(filters).lean().exec()
      return updatedApps
    }
  } catch (error) {
    console.error('Error while updating message', error)
    throw new Error('Error while updating message')
  }
}
/**
 * Deletes a message with the given messageId.
 *
 * @param {string} messageId - The ID of the message to be deleted.
 * @param {Object} filters - Filters that can be used to select many people
 * @returns {Promise<Object>} - A promise that resolves to the deleted message.
 * @throws {Error} - If there is an error while deleting the message.
 */
MessageModel.deleteMessage = async function (messageId, filters = {}) {
  try {
    if (messageId) {
      const deletedApp = await Message.findByIdAndDelete(messageId).lean().exec()
      return deletedApp
    } else {
      const deletedApp = await Message.deleteMany(filters).lean().exec()
      return deletedApp
    }
  } catch (error) {
    console.error('Error while deleting message', error)
    throw new Error('Error while deleting message')
  }
}

module.exports = MessageModel
