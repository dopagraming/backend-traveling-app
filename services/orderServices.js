const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('express-async-handler');

const Trip = require('../models/TripModel');
const Booking = require('../models/bookingModel');
const User = require('../models/UserModel');
const ApiError = require('../utils/apiError');

// @desc    Create stripe checkout session
// @route   POST /api/v1/order/checkout-session/:tripId
// @access  Protected/User
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  // 1) Get trip
  const trip = await Trip.findById(req.params.tripId);
  if (!trip) {
    return next(new ApiError(`No trip found with id ${req.params.tripId}`, 404));
  }

  // 2) Get selected date from availability
  const selectedDate = trip.availability.id(req.body.dateId);
  if (!selectedDate) {
    return next(new ApiError(`No availability found for this date`, 404));
  }

  // 3) Check if enough spots are available
  if (selectedDate.availableSpots < req.body.spots) {
    return next(new ApiError(`Not enough spots available for this date`, 400));
  }

  // 4) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: trip.title,
            description: trip.description.substring(0, 100),
            images: [trip.imageCover],
          },
          unit_amount: trip.price * 100, // convert to cents
        },
        quantity: req.body.spots,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-bookings?success=true`,
    cancel_url: `${req.protocol}://${req.get('host')}/trips/${trip.id}?canceled=true`,
    customer_email: req.body.data.email,
    client_reference_id: req.params.tripId,
    metadata: {
      tripId: req.params.tripId,
      dateId: req.body.dateId,
      spots: req.body.spots,
      userName: `${req.body.data.firstName} ${req.body.data.lastName}`,
      userEmail: req.body.data.email,
      userPhone: req.body.data.phone,
      notes: req.body.data.notes || '',
    },
  });

  // 5) Send session to client
  res.status(200).json({ status: 'success', session });
});

// @desc    Create booking after successful payment (Webhook)
// @route   POST /api/v1/order/webhook-checkout
// @access  Public
exports.webhookCheckout = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    // Create booking
    const session = event.data.object;
    
    // Get trip, user and date
    const trip = await Trip.findById(session.metadata.tripId);
    let user = await User.findOne({ email: session.customer_email });
    
    // If user doesn't exist, create one
    if (!user) {
      user = await User.create({
        name: session.metadata.userName,
        email: session.customer_email,
        password: Math.random().toString(36).slice(-8), // Generate random password
      });
    }
    
    // Create booking
    await Booking.create({
      user: user._id,
      trip: trip._id,
      tripName: trip.title,
      userName: session.metadata.userName,
      userEmail: session.customer_email,
      userPhone: session.metadata.userPhone,
      price: trip.price,
      totalPaid: (session.amount_total / 100), // Convert from cents
      sitesBooked: session.metadata.spots,
      bookingDate: trip.availability.id(session.metadata.dateId).date,
      isConfirmed: true,
      paymentMethod: 'credit_card',
      notes: session.metadata.notes,
    });
    
    // Update trip availability
    const selectedDate = trip.availability.id(session.metadata.dateId);
    selectedDate.availableSpots -= parseInt(session.metadata.spots);
    await trip.save();
  }

  res.status(200).json({ received: true });
});