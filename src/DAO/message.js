/**
 * @file DAO/message.js
 * @description - This file contains the MessageModel class for handling database operations.
 *              - It alows us to manipulate the database and Message models
 * @requires 'mongoose' - for database operations.
 * @requires '../models/message' - for the Message schema.
 * @exports MessageModel - as a class for handling database operations.
 */
const Message = require('../models/message')
const vA = require('../../utils/validate')
/**
 * Represents a MessageModel.
 *
 * @class
 * @classdesc A class that represents a MessageModel.
 */
function MessageModel (appId, body, recipents, slug) {
  this.appId = appId
  this.body = body
  this.slug = slug
  this.recipents = recipents
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
    return message
  } catch (error) {
    console.error('Error while fetching Message', error)
    throw new Error('Error while fetching Message')
  }
}

/**
 * Retrieves messages based on the provided filters.
 *
 * @param {Object} filters - The filters to apply when retrieving messages.
 * @returns {Promise<Array>} A promise that resolves to an array of messages.
 * @throws {Error} If there is an error while fetching messages.
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
      const updatedMessage = await Message.findByIdAndUpdate(messageId, messageData, { new: true })
      return updatedMessage
    } else if (filters) {
      const updatedMessages = await Message.updateMany(filters, messageData)
      return updatedMessages
    }
  } catch (error) {
    console.error('Error while updating message', error)
    throw new Error('Error while updating message')
  }
}

MessageModel.markAsSeen = async function (sender, messageId) {
  try {
    const message = await Message.findById(messageId)
    if (message) {
      const senderRecipient = message.recipents.find(recipient => recipient.id === sender)
      if (senderRecipient) {
        senderRecipient.seen = true
        await message.save()
      }
    }
    return message
  } catch (err) {
    console.error('Error updating message:', err)
    throw new Error(err)
  }
}

MessageModel.addNewRecipents = async function (filters, recipents) {
  try {
    vA.validateSchema(recipents, vA.recipientSchema)
    const message = await Message.findOneAndUpdate(filters, { $push: { recipents: { $each: recipents } } }, { new: true })
    return message
  } catch (error) {
    console.error('Error while updating message', error)
    throw new Error(error)
  }
}
/**
 * Deletes a message with the given messageId.
 *
 * @param {string} senderId - The ID of the sender who wants to delete the message.
 * @param {string} messageId - The ID of the message to be deleted.
 * @param {Object} filters - Optional filters to apply when selecting messages to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deleted message.
 * @throws {Error} - If no message is found or the sender is not in the recipients array.
 */
MessageModel.deleteMessage = async function (senderId, messageId, filters = {}) {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: messageId, ...filters },
      { $pull: { recipients: { id: senderId } } },
      { new: true }
    )
    if (!message) {
      throw new Error('Message not found or sender is not in the recipients array')
    }
    return message
  } catch (error) {
    console.error('Error while deleting message', error)
    throw new Error(error)
  }
}
module.exports = MessageModel
