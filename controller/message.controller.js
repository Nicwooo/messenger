const express = require('express');
const MessageModel = require('../model/message.model');
const UserModel = require('../model/user.model');
const checkErrors = require('../middleware/checkErrors.middleware');
const {
    idValidator,
    pageValidator,
    sizeValidator,
    discussionIdValidator,
    contentValidator
} = require('../middleware/validators.middleware');
const DiscussionModel = require('../model/discussion.model');

const router = express.Router();

/**
 * Create a message
 * @body { mongoId } discussionId
 * @body { string } content
 * 
 * @returns { message: instance of MessageModel }
 */
router.post('/',
    discussionIdValidator, contentValidator,
    (req, res, next) => checkErrors(req, res, next), async (req, res) => {
        if (!req.user) {
            return res.status(401).send({ message: 'unauthorized' });
        }

        const user = await UserModel.findOne({ _id: req.user._id });

        if (!user) {
            return res.status(404).send({ message: 'user not found' });
        }

        try {
            let message = new MessageModel({
                author: req.user._id,
                content: req.body.content,
                discussion: req.body.discussionId,
            });

            message = await message.save();

            await DiscussionModel.findOneAndUpdate({_id: req.body.discussionId }, { lastMessageSentAt: Date.now() });

            res.status(201).send({ message });
        } catch (error) {
            res.status(400).send({ error });
        }
    }
);

/**
 * Get messages from a discussion
 * @param { mongoId } id
 * @query { number } page
 * @query { number } size
 * 
 * @returns {
        message: array of instance of MessageModel,
        page: number,
        limit: number,
        total: number,
    }
 */
router.get('/:id',
    idValidator,
    pageValidator,
    sizeValidator,
    (req, res, next) => checkErrors(req, res, next), async (req, res) => {
        const pageNumber = (parseInt(req.query.page));
        const sizePerPage = parseInt(req.query.size);

        const skip = (pageNumber - 1) * sizePerPage;
        const limit = skip + sizePerPage;

        const [messagesToShow, total] = await Promise.all([
            MessageModel.find({ discussion: req.params.id, isShowed: true }, null, { skip, limit }),
            MessageModel.find({ discussion: req.params.id, isShowed: true }).count(),
        ]);

        if (messagesToShow.length === 0) {
            return res.send({ message: 'no messages in this discussion' });
        }

        res.send({
            messages: messagesToShow,
            page: pageNumber,
            limit: sizePerPage,
            total,
        });
    
    }
);

/**
 * Modify a message content
 * @param { mongoId } id
 * @body { string } content
 * 
 * @returns { message: string }
 */
router.put('/:id',
    idValidator, contentValidator,
    (req, res, next) => checkErrors(req, res, next), async (req, res) => {
        if (!req.user) {
            return res.status(401).send({ message: 'unauthorized' });
        }

        const [user, message] = await Promise.all([
            UserModel.findOne({ _id: req.user._id }),
            MessageModel.findOne({ _id: req.params.id }).populate('author'),
        ]);

        if (!user) {
            return res.status(404).send({ message: 'user not found' });
        }

        if (!message || message.isShowed === false) {
            return res.status(404).send({ message: 'message not found' });
        }

        if (message.author.username !== user.username) {
            return res.status(400).send({ message: 'you can\'t modify this message' });
        }

        await message.updateOne({ content: req.body.content });

        res.send({ message: 'message updated' });
    }
);

/**
 * Delete a message from a discussion (soft delete : we keep the message but we remove it from the discussion)
 * @param { mongoId } id
 * 
 * @returns { message: string }
 */
router.delete('/:id',
    idValidator,
    (req, res, next) => checkErrors(req, res, next), async (req, res) => {
        if (!req.user) {
            return res.status(401).send({ message: 'unauthorized' });
        }

        const [user, message] = await Promise.all([
            UserModel.findOne({ _id: req.user._id }),
            MessageModel.findOne({ _id: req.params.id }).populate('author'),
        ]);

        if (!user) {
            return res.status(404).send({ message: 'user not found' });
        }

        if (!message) {
            return res.status(404).send({ message: 'message not found' });
        }

        if (message.author.username !== user.username) {
            return res.status(400).send({ message: 'you can\'t delete this message' });
        }

        await message.updateOne({ isShowed: false });

        res.send({ message: 'message deleted' });
    }
);

module.exports = router;
