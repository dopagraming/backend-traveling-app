const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logoUrl: { type: String },
    about: { type: String },
    defaultCurrency: { type: String, default: 'USD' },
    contact: {
        email: { type: String },
        phone: { type: String },
        address: { type: String }
    },
    paymentInfo: {
        bankAccount: String,
        paypal: String
    },
    notificationPrefs: {
        newBooking: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        lowAvailability: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        payoutReceipt: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        }
    },
    status: { type: String, enum: ["pending", "active", "blocked"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
