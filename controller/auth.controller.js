const express = require('express');
const jsonwebtoken = require('jsonwebtoken');
const UserModel = require('../model/user.model');
const checkErrors = require('../middleware/checkErrors.middleware');
const { usernameValidator, passwordValidator } = require('../middleware/validators.middleware');
const { secret } = require('../configuration/config');

const router = express.Router();


/**
 * Login user
 * @body { string } username
 * @body { string } password
 * 
 * @returns { user: instance of UserModel, token: string }
 */
router.post('/login',
    usernameValidator, passwordValidator,
    (req, res, next) => checkErrors(req, res, next),  async (req, res) => {
        const user = await UserModel.findOne({ username: req.body.username });

        if (!user) {
            return res.status(404).send({ message: 'user not found' });
        }

        const samePassword = await user.comparePassword(req.body.password);

        if (!samePassword) {
            return res.status(400).send({ message: 'invalid password' });
        }

        const token = jsonwebtoken.sign({
            _id: user.id,
        }, secret);

        res.cookie('jwt', token, { maxAge: 43200000});
        res.send({ user, token });
    }
);

/**
 * Logout user
 * 
 * @returns { message: string }
 */
router.delete('/logout', async (req, res) => {
    res.cookie('jwt', req.cookies.jwt, { maxAge: 0 });

    res.send({ message: 'user logout' });
});

module.exports = router;
