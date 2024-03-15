const broker = require('../broker/queue')
const MessageModel = require('../DAO/message')

async function newMessage (app) {
  const message = await broker.consumeMessage(app)
  const newMessage = await MessageModel.createMessage(app, message)
  return newMessage
}

async function getMessages (filters) {
  return await MessageModel.getMessages(filters)
}

async function updateMessage (id, filters, message) {
  return await MessageModel.updateMessage(id, filters, message)
}

async function addNewRecipents () {
  const { slug, recipents } = await broker.addNewRecipents()
  return await MessageModel.addNewRecipents({ slug }, recipents)
}

async function deleteMessage (id, filters) {
  return await MessageModel.deleteMessage(id, filters)
}
module.exports = {
  newMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  addNewRecipents
}
