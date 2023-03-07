import joi from 'joi'
import mongoose from 'mongoose'

export const CreateUserSchema = joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    userName: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required()
}).required()

export const UpdateUserInfoSchema = joi.object({
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    userName: joi.string().optional(),
    email: joi.string().email().optional(),
    password: joi.string().optional()
}).required()

export const UpdateArtistbannedSchema = joi.object({
    isBanned: joi.boolean().required()
}).required()

export const UpdateArtistSchema = joi.object({
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    userName: joi.string().optional(),
    email: joi.string().email().optional(),
    password: joi.string().optional(),
    isBanned: joi.boolean().optional()
}).required()

export const removePassword = (user: any) => {
    const { password, ...userWithoutPassword } = user

    return userWithoutPassword
}

const userSchema = new mongoose.Schema({
    id: Number,
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    userName: {
      type: String
    },
    email: String,
    password: {
      type: Object
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    role: { 
      type: String, enum: ['admin', 'manager', 'artist'], required: true 
    },
    registrationDate: { type: Date, default: Date.now },
    updated_at: Date
})

export const User = mongoose.model('User', userSchema)