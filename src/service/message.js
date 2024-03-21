const MessageModel = require('../DAO/message')

async function newMessage (info) {
  if (!(info.payload && info.fcmData)) {
    throw new Error('Invalid message info')
  }
  return await MessageModel.createMessage(info.payload, info.fcmData)
}

async function getMessage (msgId, filters) {
  return await MessageModel.getMessage(msgId, filters)
}

async function getMessages (appId, page, limit, filters) {
  return await MessageModel.getMessages(appId, page, limit, filters)
}

async function updateMessage (msgId, msgData, filters) {
  return await MessageModel.updateMessage(msgId, msgData, filters)
}

async function deleteMessage (msgId) {
  return await MessageModel.deleteMessage(msgId)
}

async function deleteAllMessages (appId, filters) {
  return await MessageModel.deleteAllMessages(appId, filters)
}
module.exports = {
  newMessage,
  getMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  deleteAllMessages
}
