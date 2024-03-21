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

MessageModel.getMessages = async function (appId, page = 1, limit = 30, filters = {}) {
  try {
    const query = { ...filters, appId }
    console.log(page, limit)
    const messages = await Message.find(query, { __v: 0, value: 0 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec()
    const count = messages.length
    return { prev: page > 1 ? page - 1 : null, messages, next: count === limit ? page + 1 : null, count }
  } catch (error) {
    console.error('Error while getting messages', error)
    throw error
  }
}

MessageModel.updateMessage = async function (msgId, msgData, filters = {}) {
  try {
    const updatedMsg = await Message.findOneAndUpdate({ _id: msgId, ...filters }, msgData, { new: true })
    if (!updatedMsg) return null
    return updatedMsg.lean()
  } catch (error) {
    console.error('Error while updating the message', error)
    throw error
  }
}

MessageModel.deleteMessage = async function (appId, msgId) {
  try {
    const deletedMsg = await Message.findById(msgId)
    if (!deletedMsg) return 'not found'
    if (deletedMsg.appId !== appId) return 'denied'
    await deletedMsg.remove()
    return 'done'
  } catch (error) {
    console.error('Error deleting the app', error)
    throw error
  }
}
MessageModel.deleteMessages = async function (appId, filters) {
  try {
    if (!filters || Object.keys(filters).length === 0) {
      throw new Error('Filters must not be empty')
    }
    const query = { ...filters, appId }
    const deletedMessages = await Message.deleteMany(query)
    return deletedMessages.deletedCount
  } catch (error) {
    console.error('Error deleting messages', error)
    throw error
  }
}
module.exports = MessageModel
