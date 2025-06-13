const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../services/categoryServices');

const { protect, allowedTo } = require('../services/authServices');

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(protect, allowedTo('admin', 'manager'), createCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(protect, allowedTo('admin', 'manager'), updateCategory)
  .delete(protect, allowedTo('admin'), deleteCategory);

module.exports = router;