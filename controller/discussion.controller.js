const express = require('express');
const DiscussionModel = require('../model/discussion.model');
const UserModel = require('../model/user.model');
const checkErrors = require('../middleware/checkErrors.middleware');
const {
    idValidator,
    pageValidator,
    sizeValidator,
    userIdValidator,
    discussionNameValidator,
    numberOfMembersValidator
} = require('../middleware/validators.middleware');

const router = express.Router();

/**
 * Find a discussion by id
 * @param { mongoId } id
 * 
 * @returns { discussion: instance of DiscussionModel }
 */
 router.get('/:id',
 idValidator,
 (req, res, next) => checkErrors(req, res, next), async (req, res) => {
     const discussion = await DiscussionModel.findOne({ _id: req.params.id });

     if (!discussion) {
         return res.status(404).send({ message: 'discussion not found' });
     }

     res.send(discussion);
 }
);

/**
 * Get connected user discussions
 * @query { number } page
 * @query { number } size
 * @query { boolean } unseen (optionnal)
 * 
 * @returns {
        discussions: array of instance of DiscussionModel,
        page: number,
        limit: number,
        total: number,
    }
 */
router.get('/',
    pageValidator, sizeValidator,
    (req, res, next) => checkErrors(req, res, next), async (req, res) => {
        if (!req.user) {
            return res.status(401).send({ message: 'unauthorized' });
        }

        const pageNumber = (parseInt(req.query.page));
        const sizePerPage = parseInt(req.query.size);

        const skip = (pageNumber - 1) * sizePerPage;
        const limit = skip + sizePerPage;

        const [user, total] = await Promise.all([
            UserModel.findOne({ _id: req.user._id }).populate({ path: 'discussions', options: { limit, skip }, populate: { path: 'members' } }),
            UserModel.findOne({ _id: req.user._id }, { 'discussions': 1, '_id': 0 }),
        ]);

        if (req.query.unseen) {
            user.discussions = user.discussions.filter((discussion) => {
                return discussion.members.find((currentUser) => {
                    return currentUser.user.equals(user._id)
                    && new Date(currentUser.lastSeenAt).getTime() < new Date(discussion.lastMessageSentAt).getTime();
                }) ? discussion : false;

            });
        }

        if (user.discussions.length === 0) {
            return res.send({ message: `discussions not found` });
        }

        res.send({
            discussions: user.discussions,
            page: pageNumber,
            limit: sizePerPage,
            total: total.discussions.length,
        });
    }
);

/**
 * Create a discussion
 * @body { string } name
 * @body { array of mongoId objects } members
 * 
 * @returns { discussion: instance of DiscussionModel }
 */
router.post('/',
    discussionNameValidator, numberOfMembersValidator,
    (req, res, next) => checkErrors(req, res, next), async (req, res) => {
        try {
            let discussion = new DiscussionModel(req.body);
            discussion = await discussion.save();

            req.body.members.forEach((value) => {
                const user = UserModel.findOne({ _id: value.user });

                if (!user) return res.status(404).send({ message: 'user not found' });

                user.updateOne({ $push: { discussions: discussion._id } }, (error) => {
                    if (error) return res.status(400).send(error);
                });
            });

            res.status(201).send({ discussion });
        } catch (error) {
            res.status(400).send(error);
        }
    }
);

/**
 * Add a member to a discussion
 * @param { mongoId } id
 * @body { mongoId } userId
 * 
 * @returns { message: string }
 */
router.put('/:id',
    idValidator, userIdValidator,
    (req, res, next) => checkErrors(req, res, next), async (req, res) => {
        const [discussion, user] = await Promise.all([
            DiscussionModel.findOne({ _id: req.params.id }).populate('members.user'),
            UserModel.findOne({ _id: req.body.userId }),
        ]);

        if (!user) {
            return res.status(404).send({ message: 'user not found' });
        }

        if (!discussion) {
            return res.status(404).send({ message: 'discussion not found' });
        }

        const isMemberAlreadyPresent = discussion.members.find((discussionMember) => discussionMember.user.username === user.username);
        
        if (isMemberAlreadyPresent) {
            return res.status(400).send({ message: 'user already present' });
        }

        await Promise.all([
            discussion.updateOne({ $push: { members: { user: user._id } } }),
            user.updateOne({ $push: { discussions: discussion._id } }),
        ]);
        
        res.send({ message: 'user added to the discussion' });
    }
);

module.exports = router;
