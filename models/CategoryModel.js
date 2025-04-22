const mongoose = require('mongoose');

// Create a Schema for Category
const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Category title is required"],
        minlength: [3, "Category title must be at least 3 characters"],
        maxlength: [50, "Category title can't exceed 50 characters"],
        trim: true
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create the model for Category
module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
