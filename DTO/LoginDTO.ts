import Joi from 'joi'

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().optional(),
    password: Joi.string().required()
})

export default interface LoginDTO {
    email: string;
    username: string;
    password: string;
}