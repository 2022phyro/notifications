const Ajv = require('ajv')
const { ValidationError } = require('./errors')

const ajv = new Ajv()

const msgSchema = {
  type: 'object',
  properties: {
    payload: {
      type: 'object',
      properties: {
        appId: { type: 'string' },
        userId: { type: 'string' }
      },
      required: ['appId', 'userId'],
      additionalProperties: false
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
      required: ['title', 'body'],
      additionalProperties: false
    }
  },
  additionalProperties: false,
  required: ['payload', 'notification']
}

function validate (obj, schema) {
  const validate = ajv.compile(schema)
  const valid = validate(obj)
  if (!valid) {
    throw new ValidationError('Validation failed: ' + ajv.errorsText(validate.errors))
  }
}

module.exports = {
  msgSchema,
  validate
}
