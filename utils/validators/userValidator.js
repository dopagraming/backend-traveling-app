const { check, body } = require("express-validator")
const validatorMiddleware = require("../../middlewares/validatorMiddleware")
const { default: slugify } = require("slugify")
const UserModel = require("../../models/UserModel")
const bcrypt = require("bcryptjs")
exports.getUserValidator = [
    check("id").isMongoId().withMessage("Invaled User id"), validatorMiddleware
]

exports.createUserValidator = [
    check('name').notEmpty().withMessage("User name require")
        .isLength({ min: 2 }).withMessage("Too Short user name")
        .isLength({ max: 33 }).withMessage("Too Long user name")
        .custom((val, { req }) => {
            req.body.slug = slugify(val)
            return true
        })
    ,
    check('email').notEmpty().withMessage("email Require")
        .isEmail().withMessage("Invalid email adsress")
        .custom(async (val) => {
            const user = await UserModel.findOne({ email: val })
            if (user) {
                return Promise.reject(new Error('E-mail Already In User'))
            }
            return true
        })
    ,
    check("password").notEmpty().withMessage("Password Require")
        .isLength({ min: 6 }).withMessage("Too Short Password")
        .isLength({ max: 30 }).withMessage("Too Long Password")
        .custom(async (pass, { req }) => {
            const passwordConfirm = await req.body.passwordConfirm
            if (pass !== passwordConfirm) {
                throw new Error("Password Confirm incorrect")
            }
            return true
        })
    ,
    check("passwordConfirm").notEmpty().withMessage("Password Confirm Require"),
    validatorMiddleware
]

exports.changeUserPasswordValidator = [
    check("currentPassword").notEmpty().withMessage("You must enter your current password")
        .custom(async (val, { req }) => {
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                throw new Error("User not found");
            }
            const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isMatch) {
                throw new Error("Current password is incorrect");
            }
            return true
        }),
    check('password').notEmpty().withMessage("You must enter a new password").custom(async (pass, { req }) => {
        const passwordConfirm = await req.body.passwordConfirm
        if (pass !== passwordConfirm) {
            throw new Error("Password Confirm incorrect")
        }
        return true
    }),
    check("passwordConfirm").notEmpty().withMessage("You must enter your current password")
    ,
    validatorMiddleware
]
exports.updateUserValidator = [ // edit this 
    check('id').notEmpty().withMessage("Invalid User Id Format"),
    validatorMiddleware
]
exports.deleteUserValidator = [
    check('id').notEmpty().withMessage("Invalid User Id Format"),
    validatorMiddleware
]