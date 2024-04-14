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
        appId: { type: 'string' },
        userId: { type: 'string' }

      }
    },
    notification: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        data: { type: 'object' },
        title: { type: 'string' },
        body: { type: 'string' },
        icon: { type: 'string' },
        clickUrl: { type: 'string' },
        badge: { type: 'number' }
      },
      required: ['title', 'body']
    }
  },
  // additionalProperties: false,
  required: ['payload', 'notification']
}

const appSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3, maxLength: 30 }
  },
  required: ['name'],
  additionalProperties: false

}

const appUpdateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3, maxLength: 30 }
  },
  additionalProperties: false
}

const orgSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    phone: { type: 'string', maxLength: 20 }
  },
  required: ['firstName', 'lastName', 'email', 'password', 'phone'],
  additionalProperties: false
}

const orgUpdateSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    phone: { type: 'string', maxLength: 20 }
  },
  additionalProperties: false
}

const subscriptionSchema = {
  type: 'object',
  properties: {
    p256dh: { type: 'string' },
    auth: { type: 'string' },
    endpoint: { type: 'string' }
  },
  required: ['p256dh', 'auth', 'endpoint']
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

function validateOrg (app) {
  const errors = {}
  if (app.firstName) {
    const [invalid, msgs] = validateName(app.firstName)
    if (!invalid) {
      errors.name = msgs
    }
  }
  if (app.lastName) {
    const [invalid, msgs] = validateName(app.lastName)
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
  orgSchema,
  orgUpdateSchema,
  appUpdateSchema,
  subscriptionSchema,
  validateSchema,
  validateName,
  validatePwd,
  validateApp,
  validateOrg,
  validateEmail
}
