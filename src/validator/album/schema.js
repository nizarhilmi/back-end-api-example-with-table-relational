const Joi = require('joi');

const albumValidate = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required()
});

module.exports = { albumValidate };