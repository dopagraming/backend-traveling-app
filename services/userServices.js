const expressAsyncHandler = require("express-async-handler")
const UserModel = require("../models/UserModel")
const { deleteOne, createOne, getOne, getGroup, updateOne } = require("./handlebarsFactory")
const apiError = require("../utils/apiError")
const { default: slugify } = require("slugify")
const bcrypt = require("bcryptjs")
const createToken = require("../utils/createToken")
// desc Get List Of Users Users
// @ route Get /api/v1/users/
// @access private

exports.getUsers = getGroup(UserModel)

exports.setUser = createOne(UserModel, "user", "name")

exports.getUser = getOne(UserModel)

// exports.updateUser = updateOne(UserModel, "user", "name")
exports.updateUser = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params
    const user = await UserModel.findOneAndUpdate(req.body.id, {
        name: req.body.name,
        slug: slugify(req.body.name),
        email: req.body.email,
        phone: req.body.phone,
        profileImage: req.body.profileImage,
        role: req.body.role,
    }, {
        new: true
    })
    if (!user) {
        return next(new apiError(`No document for this ${id}`, 404))
    }
    res.status(200).json({ data: user })
})
exports.updatePasswordUser = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params
    const user = await UserModel.findOneAndUpdate(req.body.id, {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangeAt: Date.now()
    }, {
        new: true
    })
    if (!user) {
        return next(new apiError(`No document for this ${id}`, 404))
    }
    res.status(200).json({ data: user })
})

exports.getLoggedUserData = expressAsyncHandler(async (req, res, next) => {
    req.params.id = req.user._id
    next()
})
exports.changeLoggedUserPassword = expressAsyncHandler(async (req, res, next) => {
    const user = await UserModel.findOneAndUpdate(req.user._id, {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangeAt: Date.now()
    }, {
        new: true
    })
    if (!user) {
        return next(new apiError(`No document for this ${id}`, 404))
    }
    const token = createToken(req.user._id)
    res.status(200).json({ token: token })
})
exports.updateLoggedUserData = expressAsyncHandler(async (req, res, next) => {
    const user = await UserModel.findOneAndUpdate(req.user._id, {
        name: req.body.name,
        slug: slugify(req.body.name),
        email: req.body.email,
        phone: req.body.phone,
        role: req.body.role,
    }, {
        new: true
    })
    res.status(200).json({ data: user })
})
exports.deleteUser = deleteOne(UserModel)