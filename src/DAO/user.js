const UserModel = require('../models/user')

/**
 * User Model
 * @namespace User
 */
const User = {
  /**
   * Subscribe a user to receive notifications.
   * @async
   * @memberof User
   * @param {string} userId - The ID of the user.
   * @param {string} appId - The ID of the application.
   * @param {string} device - The notification device.
   * @returns {Promise<Object|null>} The updated user object or null if not found.
   */
  async subscribe (userId, appId, device) {
    const user = await UserModel.findOneAndUpdate(
      { dbId: userId, appId },
      { $addToSet: { devices: device } },
      { new: true, upsert: true }
    )
    return user || null
  },

  /**
   * Unsubscribe a user from receiving notifications.
   * @async
   * @memberof User
   * @param {string} userId - The ID of the user.
   * @param {string} appId - The ID of the application.
   * @param {string} device - The notification device.
   * @returns {Promise<Object|null>} The updated user object or null if not found.
   */
  async unsubscribe (userId, appId, device) {
    const user = await UserModel.findOneAndUpdate(
      { dbId: userId, appId },
      { $pull: { devices: device } }
    )
    return user || null
  },

  /**
   * Delete a user.
   * @async
   * @memberof User
   * @param {string} userId - The ID of the user.
   * @param {string} appId - The ID of the application.
   * @returns {Promise<Object|null>} The deleted user object or null if not found.
   */
  async delete (userId, appId) {
    const user = await UserModel.findOneAndDelete({ dbId: userId, appId })
    return user || null
  },

  /**
   * Get a user by ID and application ID.
   * @async
   * @memberof User
   * @param {string} userId - The ID of the user.
   * @param {string} appId - The ID of the application.
   * @returns {Promise<Object|null>} The user object or null if not found.
   */
  async get (userId, appId) {
    const user = await UserModel.findOne({ dbId: userId, appId })
    if (!user) return null
    const result = user.toObject()
    delete result.__v
    return result
  },

  /**
   * Delete multiple users by their IDs and application ID.
   * @async
   * @memberof User
   * @param {string[]} userIds - The IDs of the users.
   * @param {string} appId - The ID of the application.
   * @returns {Promise<Object>} The result of the delete operation.
   */
  async deleteMany (userIds, appId) {
    const result = await UserModel.deleteMany({ dbId: { $in: userIds }, appId })
    return result
  }
}
module.exports = User
