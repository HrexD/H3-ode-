import joi from 'joi'
const mongoose = require('mongoose');
const User = require('./User');

export const CreateModelSchema = joi.object({
    title: joi.string().required(),
    fileName: joi.string().required(),
    url: joi.string().uri().required()
}).required()

export const UpdateModelSchema = joi.object({
    title: joi.string().optional(),
    fileName: joi.string().optional(),
    url: joi.string().uri().optional()
}).required()

export const removeApprovals = (model: any) => {
    const { approvals, ...modelWithoutApprovals } = model

    return modelWithoutApprovals
}

const modelSchema = new mongoose.Schema({
    artistId: {
        type: Number,
        required: true
    },
    title: {
        type: String
    },
    fileName: {
        type: String
    },
    url: {
        type: String
    },
    approvals: [{
        approval: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Approval'
        }
    }],
    isApproved: {
        type: String,
        enum: ['approved', 'rejected', 'pending'],
        required: true,
        default: 'pending'
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

export const Model = mongoose.model('Model', modelSchema);