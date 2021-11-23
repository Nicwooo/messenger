const express = require('express');
const UserModel = require('../model/user.model');
const checkErrors = require('../middleware/checkErrors.middleware');
const { idValidator, usernameValidator, passwordValidator } = require('../middleware/validators.middleware');

const router = express.Router();

/**
 * Find users by
 * 
 * @returns { array of instance of UserModel }
 */
router.get('/', async (req, res) => {
    const users = await UserModel.find();
  
    res.send(users);
});

/**
 * Get the current user informations
 * 
 * @returns { instance of UserModel }
 */
 router.get('/me', async (req, res) => {
    if (!req.user) return res.status(401).send({ message: 'unauthorized' });

    const user = await UserModel.findOne({ _id: req.user._id });

    if (!user) return res.status(404).send({ message: 'user not found' });

    res.send({ user });
});

/**
 * Find user by id
 * @param { mongoId } id
 * 
 * @returns { instance of UserModel }
 */
router.get('/:id',
    idValidator,
    (req, res, next) => checkErrors(req, res, next), async (req, res) => {
        const user = await UserModel.findOne({ _id: req.params.id });

        if (!user) {
            return res.status(404).send({ message: 'user not found' });
        }

        res.send(user);
    }
);

/**
 * Create a user
 * @body { string } username
 * @body { string } password
 * 
 * @returns { instance of UserModel }
 */
router.post('/',
    usernameValidator, passwordValidator,
    (req, res, next) => checkErrors(req, res, next), async (req, res) => {
    try {
        let user = new UserModel(req.body);
        user = await user.save();

        res.status(201).send({ user });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
