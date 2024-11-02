import Joi from 'joi';

export const SignUpDto = Joi.object({
  name: Joi.string().min(2).max(20).required(),
  username: Joi.string().min(2).max(10).required(),
  email: Joi.string().email().min(2).max(20).required(),
  password: Joi.string().required(),
  phone: Joi.string().length(11).required(),
});
