const InvariantError = require('../../exception/InvariantError');
const { albumValidate } = require('./schema');

const Validation = {
    validateAlbumPayload: (payload) => {
        const validationResult = albumValidate.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = Validation;