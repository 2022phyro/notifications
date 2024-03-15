const Ajv = require('ajv')

const ajv = new Ajv()

const recipientSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      seen: { type: 'boolean' }
    },
    required: ['id', 'seen'],
    additionalProperties: false
  }
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
  validateSchema
}
