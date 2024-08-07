/**
 * @file config/db.js
 * @description This file is responsible for connecting to the MongoDB database.
 * @requires mongoose for making the connections to the database
 */
const mongoose = require('mongoose')
const { dbLogger } = require('../utils/logger')
/**
 * Connects to the MongoDB database using the provided database URI.
 *
 * @returns {Promise} A promise that resolves when the connection is successful.
 * @throws {Error} If there is an error connecting to the database.
 */

function connect (uri = undefined, attempts = 5) {
  const databaseUri = process.env.DB_URI || 'mongodb://localhost/notifai'

  mongoose.connect(databaseUri)
    .then(() => {
      dbLogger.info('Connection successful')
    })
    .catch((err) => {
      if (attempts > 0) {
        dbLogger.error('Database connection error, retrying in 5 seconds...', err)
        setTimeout(() => connect(attempts - 1), 5000)
      } else {
        dbLogger.error('Database connection error, Exiting...!', err)
        process.exit(1)
      }
    })
}

module.exports = connect
