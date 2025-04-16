
const TripModel = require("../models/TripModel")
const stripe = require('stripe')(`${process.env.STRIPE_SECRET}`);
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const bookingModel = require("../models/bookingModel");

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/orders/checkout-session/TripId
// @access  Public
exports.checkoutSession = asyncHandler(async (req, res, next) => {
    const { dateId, tripId, data, spots } = req.body

    // 1) Get Trip depend on TripId
    const trip = await TripModel.findById(tripId);
    if (!trip) {
        return next(
            new ApiError(`There is no such trip with id ${tripId}`, 404)
        );
    }
    // 2) Selected date is true 

    const selectedDate = trip.availability.find((e) => String(e._id) == dateId);
    if (!selectedDate) {
        return next(
            new ApiError(`There is no such date with id ${dateId}`, 404)
        );
    }

    // 3) Are there available spots
    const availability = selectedDate.availableSpots >= spots;
    if (!availability) {
        return next(
            new ApiError(`There is no available spots for ${req.body.spots}`, 404)
        );
    }
    // 4) Get total price
    const totalPrice = trip.price * spots;

    // 3) Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
        line_items: [{
            price_data: {
                currency: 'usd',
                unit_amount: totalPrice * 100,
                product_data: {
                    name: trip.title,
                },
            },
            quantity: 1
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}`,
        cancel_url: `${req.protocol}://${req.get('host')}`,
        customer_email: data.email,
        client_reference_id: dateId,
        metadata: {
            tripName: trip.title,
            date: selectedDate.date,
            spots,
            totalPrice,
            phoneNumber: data.phone
        },
        cancel_url: `${req.protocol}://${req.get('host')}`
    });

    // 4) send session to response
    res.status(200).json({ status: 'success', session });
});


const createBooking = asyncHandler(async (session) => {
    const newDoc = await bookingModel.create({
        userName: session.data.object.customer_details.name,
        userEmail: session.data.object.customer_details.email,
        tripName: session.data.object.metadata.tripName,
        userPhone: session.data.object.metadata.phoneNumber,
        spotsBooked: session.data.object.metadata.spots,
        totalPaid: session.data.object.metadata.totalPrice,
        paymentMethod: "credit_card",
        isConfirmed: true,
        notes: ""
    });
    console.log(newDoc)
    res.status(201).json({ data: newDoc });
})

// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            "whsec_V8uGZTsI6wwNjmw6MyScG6NhWVF2VWEX"
        );
    } catch (err) {
        console.log("there is problem here: ", err)
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        console.log("checkout session completed ....")
        createBooking(event)
    }

    res.status(200).json({ received: true });
});


