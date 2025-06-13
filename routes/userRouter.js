const express = require('express');

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require('../utils/validators/userValidator');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  addTripToWishlist,
  removeTripFromWishlist,
  getLoggedUserWishlist,
} = require('../services/userServices');

const { protect, allowedTo } = require('../services/authServices');

const router = express.Router();

// User routes
router.use(protect);

router.get('/getMe', getLoggedUserData, getUser);
router.put('/updateMyPassword', updateLoggedUserPassword);
router.put('/updateMe', updateLoggedUserValidator, updateLoggedUserData);
router.delete('/deleteMe', deleteLoggedUserData);

// Wishlist routes
router.route('/wishlist')
  .post(addTripToWishlist)
  .get(getLoggedUserWishlist);

router.delete('/wishlist/:tripId', removeTripFromWishlist);

// Admin routes
router.use(allowedTo('admin', 'manager'));

router.put(
  '/changePassword/:id',
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route('/')
  .get(getUsers)
  .post(createUserValidator, createUser);

router
  .route('/:id')
  .get(getUserValidator, getUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;