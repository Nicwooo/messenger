const mongoose = require('../configuration/mongoose');

const discussionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        maxLength: 100,
        validate: {
            validator: async (name) => {
                const discussions = await DiscussionModel.find({ name });

                return discussions.length === 0;
            },
            message: 'Discussion name already taken',
        }
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        lastSeenAt: {
            type: Date,
            default: Date.now(),
        },
    }],
    lastMessageSentAt: Date,
}, { timestamps: true });

const DiscussionModel = mongoose.model('Discussion', discussionSchema, 'discussions');

module.exports = DiscussionModel;
