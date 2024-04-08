const express = require('express')
const { authenticateJWT } = require('../middleware/auth')
const MessageController = require('../controllers/message')
const router = express.Router()

router.get('/:id', authenticateJWT, MessageController.getMessage)
router.get('', authenticateJWT, MessageController.getMessages)
router.get('/:id/read', authenticateJWT, MessageController.markAsRead)
router.delete('/:id', authenticateJWT, MessageController.deleteMessage)
router.post('', authenticateJWT, MessageController.newMessage)
router.delete('', authenticateJWT, MessageController.deleteAllMessages)

module.exports = router
