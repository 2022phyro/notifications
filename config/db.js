/**
 * @file config/db.js
 * @description This file is responsible for connecting to the MongoDB database.
 * @requires mongoose for making the connections to the database
 */
const mongoose = require('mongoose')

/**
 * Connects to the MongoDB database using the provided database URI.
 *
 * @returns {Promise} A promise that resolves when the connection is successful.
 * @throws {Error} If there is an error connecting to the database.
 */
function connect () {
  // const DB_USER = process.env.DB_USER
  // const DB_PASSWORD = process.env.DB_PASSWORD
  // const DB_HOST = process.env.DB_HOST
  // const DB_PORT = process.env.DB_PORT
  // const DB_NAME = process.env.DB_NAME

  // const databaseUri = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
  const databaseUri = 'mongodb://localhost/notifai'
  mongoose.connect(databaseUri)
    .then(() => {
      console.log('Connected to MongoDB')
    })
    .catch((err) => {
      console.log('Database connection error, Exiting...!')
      console.log(err)
      process.exit(1)
    })
}

module.exports = connect
