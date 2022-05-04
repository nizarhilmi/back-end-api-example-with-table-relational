const InvariantError = require('../../exception/InvariantError');
const { songValidate } = require('./schema');

const Validation = {
  validateSongPayload: (payload) => {
    const validationResult = songValidate.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = Validation;