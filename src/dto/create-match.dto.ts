import Joi from 'joi';

export const CreateMatchDto = Joi.object({
  type: Joi.string().required(),
  password: Joi.string().min(4).max(10).required(),
});
