const Message = require('../models/message')

function MessageModel (payload, data) {
  this.nType = payload.nType
  this.appId = payload.appId
  this.userId = payload.userId
  this.value = data
}

MessageModel.createMessage = async function (payload, data) {
  try {
    const msgModel = new MessageModel(payload, data)
    const msg = new Message(msgModel)
    await msg.save()
    return msg
  } catch (error) {
    console.error('Error while creating message', error)
    throw error
  }
}

MessageModel.getMessage = async function (msgId, filters) {
  let query = {}
  try {
    if (msgId) {
      query._id = msgId
    }
    if (filters) {
      query = { ...query, ...filters }
    }
    const msg = await Message.findOne(query)
    if (!msg) return null
    return msg.toObject()
  } catch (error) {
    console.error('Error while getting message', error)
    throw error
  }
}

MessageModel.getMessages = async function (appId, filters = {}, page = 1, limit = 30) {
  try {
    const query = { ...filters, appId }
    const messages = await Message.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec()
    return [page > 1 ? page - 1 : null, messages, messages.length === limit ? page + 1 : null]
  } catch (error) {
    console.error('Error while getting messages', error)
    throw error
  }
}

MessageModel.updateMessage = async function (msgId, msgData) {
  try {
    const updatedMsg = await Message.findByIdAndUpdate(msgId, msgData)
    if (!updatedMsg) return null
    return updatedMsg.toObject()
  } catch (error) {
    console.error('Error while updating the message', error)
    throw error
  }
}

MessageModel.deleteMessage = async function (msgId) {
  try {
    const deletedMsg = await Message.findByIdAndDelete(msgId)
    return deletedMsg
  } catch (error) {
    console.error('Error deleting the app', error)
    throw error
  }
}

module.exports = MessageModel
