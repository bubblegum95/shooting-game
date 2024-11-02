import Joi from 'joi';

export const SignInDto = Joi.object({
  email: Joi.string().email().min(2).max(20).required(),
  password: Joi.string().required(),
});
