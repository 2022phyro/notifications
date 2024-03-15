const {
  newMessage,
  getMessages,
  updateMessage,
  deleteMessage
} = require('../service/messages')

function listenForMessages() {
  
}


function connect (socket, userId) {
  // verify user and check jwt
  console.log('User connected:', socket.id)
  socket.join(userId.toString())
}

const disconnect = (socket) => {
  const rooms = Object.keys(socket.rooms)
  rooms.forEach(room => {
    socket.leave(room)
  })
  console.log('User disconnected:', socket.id)
}


module.exports = {
  connect,
  disconnect,
}
