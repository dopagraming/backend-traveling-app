const { check, body } = require("express-validator")
const validatorMiddleware = require("../../middlewares/validatorMiddleware")
const { default: slugify } = require("slugify")

exports.loginValidator = [
    check('email').notEmpty().withMessage("email Require")
        .isEmail().withMessage("Invalid email adsress")
    ,
    check("password").notEmpty().withMessage("Password Require")
        .isLength({ min: 6 }).withMessage("Too Short Password")
        .isLength({ max: 30 }).withMessage("Too Long Password")
    ,
    validatorMiddleware
]

