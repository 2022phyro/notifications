const User = require('../models/user')

/**
 * User Model
 * @namespace UserModel
 */
const UserModel = {
  /**
   * Subscribe a user to receive notifications.
   * @async
   * @memberof UserModel
   * @param {string} userId - The ID of the user.
   * @param {string} appId - The ID of the application.
   * @param {string} token - The notification token.
   * @returns {Promise<Object|null>} The updated user object or null if not found.
   */
  async subscribe (userId, appId, token) {
    const user = await User.findOneAndUpdate(
      { dbId: userId, appId },
      { $push: { tokens: token } },
      { new: true, upsert: true }
    )
    return user || null
  },

  /**
   * Unsubscribe a user from receiving notifications.
   * @async
   * @memberof UserModel
   * @param {string} userId - The ID of the user.
   * @param {string} appId - The ID of the application.
   * @param {string} token - The notification token.
   * @returns {Promise<Object|null>} The updated user object or null if not found.
   */
  async unsubscribe (userId, appId, token) {
    const user = await User.findOneAndUpdate(
      { dbId: userId, appId },
      { $pull: { tokens: token } }
    )
    return user || null
  },

  /**
   * Delete a user.
   * @async
   * @memberof UserModel
   * @param {string} userId - The ID of the user.
   * @param {string} appId - The ID of the application.
   * @returns {Promise<Object|null>} The deleted user object or null if not found.
   */
  async delete (userId, appId) {
    const user = await User.findOneAndDelete({ dbId: userId, appId })
    return user || null
  },

  /**
   * Get a user by ID and application ID.
   * @async
   * @memberof UserModel
   * @param {string} userId - The ID of the user.
   * @param {string} appId - The ID of the application.
   * @returns {Promise<Object|null>} The user object or null if not found.
   */
  async get (userId, appId) {
    const user = await User.findOne({ dbId: userId, appId })
    if (!user) return null
    const result = user.toObject()
    delete result.__v
    return result
  },

  /**
   * Delete multiple users by their IDs and application ID.
   * @async
   * @memberof UserModel
   * @param {string[]} userIds - The IDs of the users.
   * @param {string} appId - The ID of the application.
   * @returns {Promise<Object>} The result of the delete operation.
   */
  async deleteMany (userIds, appId) {
    const result = await User.deleteMany({ dbId: { $in: userIds }, appId })
    return result
  }
}
module.exports = UserModel
