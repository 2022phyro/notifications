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
    fcmData: {
      type: 'object',
      properties: {
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
      required: ['notification', 'name']
    }
  },
  required: ['payload', 'fcmData']
}

const appSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    phone: { type: 'string', maxLength: 20 }
  },
  required: ['name', 'email', 'password', 'phone']
}

const appUpdateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3 },
    email: { type: 'string' },
    password: { type: 'string', minLength: 5 },
    phone: { type: 'string', maxLength: 20 }
    // Add other fields as needed
  },
  additionalProperties: false
}
function validateSchema (obj, schema) {
  const validate = ajv.compile(schema)
  const valid = validate(obj)
  if (!valid) {
    throw new Error('Validation failed: ' + ajv.errorsText(validate.errors))
  }
}

function validateName (name) {
  const errors = []
  if (typeof name !== 'string') {
    errors.push('Must be a string')
  }
  if (name.length < 3 || name.length > 20) {
    errors.push('App name should be between 3 and 20 characters')
  }
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    errors.push('App name must contain only letters, underscores, and numbers')
  }
  if (!/^[a-zA-Z]/.test(name)) {
    errors.push('App name must start with a letter')
  }
  return [errors.length === 0, errors]
}

function validatePwd (password) {
  const errors = []
  if (typeof password !== 'string') {
    errors.push('Password must be a string')
  }
  const hasLetters = /[a-zA-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  if (!hasLetters || !hasNumbers) {
    errors.push('Password must contain both letters and numbers')
  }
  if (password.length < 5) {
    errors.push('Password should be at least 5 characters')
  }
  return [errors.length === 0, errors]
}
function validateEmail (email) {
  // Regular expression for basic email validation
  const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
  const stat = regex.test(email)
  return [stat, stat ? [] : ['Invalid email']]
}

function validatePhone (phone) {
  // Regular expression to validate phone number
  const regex = /^\+\d{1,4}\s\d{1,14}$/
  const stat = regex.test(phone)
  return [stat, stat ? [] : ['Phone should be in this format +234 1234567890...']]
}
function validateApp (app) {
  const errors = {}
  if (app.name) {
    const [invalid, msgs] = validateName(app.name)
    if (!invalid) {
      errors.name = msgs
    }
  }
  if (app.password) {
    const [invalid, msgs] = validatePwd(app.password)
    if (!invalid) {
      errors.password = msgs
    }
  }
  if (app.email) {
    const [invalid, msgs] = validateEmail(app.email)
    if (!invalid) {
      errors.email = msgs
    }
  }
  if (app.phone) {
    const [invalid, msgs] = validatePhone(app.phone)
    if (!invalid) {
      errors.phone = msgs
    }
  }
  return [Object.keys(errors).length === 0, errors]
}
module.exports = {
  recipientSchema,
  fcmSchema,
  appSchema,
  appUpdateSchema,
  validateSchema,
  validateName,
  validatePwd,
  validateApp
}
