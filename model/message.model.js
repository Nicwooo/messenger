const mongoose = require('../configuration/mongoose');

const messageSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        maxlength: 280,
    },
    discussion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
    },
    isShowed: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const MessageModel = mongoose.model('Message', messageSchema, 'messages');

module.exports = MessageModel;
