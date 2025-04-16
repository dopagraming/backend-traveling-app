const express = require("express")
const { getUsers, setUser, getUser, deleteUser, updateUser } = require("../services/userServices")
const { createUserValidator } = require("../utils/validators/userValidator")


const rotuer = express.Router()

rotuer.route("/").get(getUsers).post(createUserValidator, setUser)
rotuer.route("/:id").get(getUser).delete(deleteUser).put(updateUser)
module.exports = rotuer