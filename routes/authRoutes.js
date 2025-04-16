const express = require("express")
const { login, allowTo, returnUser, protect } = require("../services/authServices")
const { loginValidator } = require("../utils/validators/authValidator")

const router = express.Router()


router.route("/login").post(loginValidator, login)
router.route("/requireAuth").get(protect, allowTo("admin", "manager"), returnUser)
module.exports = router