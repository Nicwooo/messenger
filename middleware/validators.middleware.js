const { param, query, body } = require("express-validator");

// param validators
const idValidator = param('id').notEmpty().isMongoId().withMessage('id needs to be a mongodb id');

// query validators
const pageValidator = query('page').notEmpty().isNumeric().isLength({min: 1}).withMessage('page number required');
const sizeValidator = query('size').notEmpty().isNumeric().isLength({min: 1}).withMessage('number of elements per page required');

// body validators
const userIdValidator = body('userId').notEmpty().isMongoId().withMessage('id needs to be a mongoDB id');
const discussionNameValidator = body('name').notEmpty().trim().escape().withMessage('discussion name is required').isLength({ max: 100 }).withMessage('100 characters maximum');
const numberOfMembersValidator = body('members').notEmpty().withMessage('at least 2 members needed');
const discussionIdValidator = body('discussionId').notEmpty().isMongoId().withMessage('id must be a mongodb id');
const contentValidator = body('content').notEmpty().withMessage('content needed').isString().trim().escape().isLength({ max: 280 }).withMessage('280 characters maximum');
const usernameValidator = body('username').notEmpty().withMessage('username is required').isLength({ max: 100 }).withMessage('100 characters maximum');
const passwordValidator = body('password').notEmpty().withMessage('password is required').isLength({ max: 30 }).withMessage('30 characters maximum');

module.exports = {
    idValidator,
    pageValidator,
    sizeValidator,
    userIdValidator,
    discussionNameValidator,
    numberOfMembersValidator,
    discussionIdValidator,
    contentValidator,
    usernameValidator,
    passwordValidator,
};
