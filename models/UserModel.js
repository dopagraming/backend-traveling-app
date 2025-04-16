const mongoose = require("mongoose")

const bcrypt = require("bcryptjs")
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "User name required"],
        trim: true
    },
    slug: {
        type: String,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, "Email required"],
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password required"],
        minlength: [6, "Too short password"],
    },
    passwordChangeAt: Date,
    phone: String,
    profileImage: String,
    passwordResetCode: String,
    passwordResetExpired: Date,
    passwordResetVerified: Boolean,
    role: {
        type: String,
        enum: ["user", "admin", "manager"],
        default: "user"
    },
    active: {
        type: Boolean,
        default: true
    },
    wishlist: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Trip"
        }
    ],
    addresses: [
        {
            id: { type: mongoose.Schema.Types.ObjectId },
            alias: String,
            details: String,
            phone: String,
            city: String,
            postalCode: String,
        }
    ]

}, { timestamps: true })


userSchema.pre("save", async function (next) {
    // if (!this.password.isModified()) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

const UserModel = mongoose.model('User', userSchema)
module.exports = UserModel