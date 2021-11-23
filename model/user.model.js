const mongoose = require('../configuration/mongoose');
const bcrypt = require('bcrypt');

const salt = '$2b$10$uMMerxBWR8pPg8NFXLewXe';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        index: true,
        unique: true,
        required: true,
        maxLength: 100,
        validate: {
            validator: async (value) => {
                const users = await UserModel.find({ username: value });
                return users.length === 0;
            },
            message: 'User already exists',
        }
    },
    password: {
        type: String,
        required: true,
        maxLength: 30,
    },
    discussions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
    }],
}, { timestamps: true });

/**
 * Method to hash the password before save the user
 */
userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);

        user.password = hash;

        next();
    });
});

/**
 * Method to compare the user password with the password in the params
 * @param { string } password 
 * @returns Promise
 */
userSchema.methods.comparePassword = function (password) {
    const user = this;

    return new Promise((resolve, reject) => {
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) return reject(err);

            resolve(user.password === hash);
        });
    });
};

const UserModel = mongoose.model('User', userSchema, 'users');

module.exports = UserModel;
