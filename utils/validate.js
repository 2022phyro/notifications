const Ajv = require('ajv')

const ajv = new Ajv()

const recipientSchema = {
}

const fcmSchema = {
  type: 'object',
  properties: {
    payload: {
      type: 'object',
      properties: {
        appid: { type: 'string' },
        nType: { type: 'string' },
        userId: { type: 'string' }

      }
    },
    name: { type: 'string' },
    data: { type: 'object' },
    notification: { type: 'object' },
    android: { type: 'object' },
    webpush: { type: 'object' },
    apns: { type: 'object' },
    fcm_options: { type: 'object' },
    token: { type: 'string' },
    topic: { type: 'string' },
    condition: { type: 'string' }
  },
  oneOf: [
    { required: ['token'] },
    { required: ['topic'] },
    { required: ['condition'] }
  ],
  required: ['payload', 'notification', 'name']
}

const appSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    phone: { type: 'string' }
  },
  required: ['name', 'email', 'password', 'phone']
}
function validateSchema (obj, schema) {
  const validate = ajv.compile(schema)
  const valid = validate(obj)
  if (!valid) {
    throw new Error('Invalid: ' + ajv.errorsText(validate.errors))
  }
}

module.exports = {
  recipientSchema,
  fcmSchema,
  appSchema,
  validateSchema
}
