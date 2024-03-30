const MessageModel = require('../models/message')

function Message (payload, data) {
  this.nType = payload.nType
  this.appId = payload.appId
  this.userId = payload.userId
  this.value = data
}

Message.createMessage = async function (payload, data) {
  try {
    const msgModel = new Message(payload, data)
    const msg = new MessageModel(msgModel)
    await msg.save()
    return msg
  } catch (error) {
    console.error('Error while creating message', error)
    throw error
  }
}

Message.getMessage = async function (msgId, filters) {
  let query = {}
  try {
    if (msgId) {
      query._id = msgId
    }
    if (filters) {
      query = { ...query, ...filters }
    }
    const msg = await MessageModel.findOne(query)
    if (!msg) return null
    return msg.toObject()
  } catch (error) {
    console.error('Error while getting message', error)
    throw error
  }
}

Message.getMessages = async function (appId, page = 1, limit = 30, filters = {}) {
  try {
    const query = { ...filters, appId }
    console.log(page, limit)
    const messages = await MessageModel.find(query, { __v: 0, value: 0 })
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

Message.updateMessage = async function (msgId, msgData, filters = {}) {
  try {
    const updatedMsg = await MessageModel.findOneAndUpdate({ _id: msgId, ...filters }, msgData, { new: true })
    if (!updatedMsg) return null
    return updatedMsg
  } catch (error) {
    console.error('Error while updating the message', error)
    throw error
  }
}

Message.deleteMessage = async function (appId, msgId) {
  try {
    const deletedMsg = await MessageModel.findById(msgId)
    if (!deletedMsg) return 'not found'
    if (deletedMsg.appId !== appId) return 'denied'
    await deletedMsg.remove()
    return 'done'
  } catch (error) {
    console.error('Error deleting the app', error)
    throw error
  }
}
Message.deleteMessages = async function (appId, filters) {
  try {
    if (!filters || Object.keys(filters).length === 0) {
      throw new Error('Filters must not be empty')
    }
    const query = { ...filters, appId }
    const deletedMessages = await MessageModel.deleteMany(query)
    return deletedMessages.deletedCount
  } catch (error) {
    console.error('Error deleting messages', error)
    throw error
  }
}
module.exports = Message
