const CategoryModel = require("../models/CategoryModel");
const { getGroup, getOne, createOne, updateOne, deleteOne } = require("./handlebarsFactory");

//@ desc get all categories
//@ route get /api/v1/categories
//@ access Public

exports.getCategories = getGroup(CategoryModel)

//@ desc get specific category
//@ route get /api/v1/categories/:id
//@ access Public

exports.getCategory = getOne(CategoryModel)


//@ desc Update category
//@ route put /api/v1/categories/:id
//@ access Public

exports.updateCategory = updateOne(CategoryModel)

//@ desc create category
//@ route post /api/v1/categories/
//@ access private


exports.createCategory = createOne(CategoryModel)


//@ desc delete category
//@ route delete /api/v1/categories/:id
//@ access private


exports.deleteCategory = deleteOne(CategoryModel)



