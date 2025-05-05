const asyncHandler = require('express-async-handler');
const ApiFeatuers = require("../utils/apiFeatures");
const apiError = require('../utils/apiError');
exports.deleteOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const document = await Model.findByIdAndDelete(id);

        if (!document) {
            return next(new apiError(`No document for this id ${id}`, 404));
        }
        res.status(204).json({ message: "document removed" });
    });

exports.updateOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if (!document) {
            return next(
                new ApiError(`No document for this id ${req.params.id}`, 404)
            );
        }
        res.status(200).json({ data: document });
    });

exports.getOne = (model, populateOpt) => (
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        // build query
        let query = model.findById(id)
        if (populateOpt) {
            query = query.populate({
                path: populateOpt,
                select: 'name'
            })
        }
        const one = await query
        if (!one) {
            return next(new apiError("There Is No One For This Id", 404))
        }
        res.status(200).json({ data: one })
    })
)


exports.getGroup = (model, populateOpt) =>
    asyncHandler(async (req, res) => {
        let filter = {};
        if (req.filterObj) {
            filter = req.filterObj;
        }

        const documentsCounts = await model.countDocuments();
        const apiFeatures = new ApiFeatuers(model.find(filter), req.query)
            .paginate(documentsCounts).sort()
            .filter()
            .search()
            .limitFields()

        let { mongooseQuery, paginationResult } = apiFeatures;

        if (populateOpt) {
            mongooseQuery = mongooseQuery.populate({
                path: 'category',
                select: 'title _id'
            });
        }

        const documents = await mongooseQuery;
        res
            .status(200)
            .json({ results: documents.length, paginationResult, data: documents });
    });

exports.createOne = (Model) =>
    asyncHandler(async (req, res) => {
        const newDoc = await Model.create(req.body);
        res.status(201).json({ data: newDoc });
    });


exports.setCategoryIdToFilter = (req, res, next) => {
    if (req.params.category) {
        req.filterObj = { category: req.params.category };
    }
    next();
};