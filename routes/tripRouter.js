const express = require("express");
const { createTrip, getTrip, updateTrip, deleteTrip, getAllTrips, checkavailability } = require("../services/tripService");
const { createTripValidator, getTripValidator, updateTripValidator, deleteTripValidator } = require("../utils/validators/tripValidator");
const router = express.Router()

router.route("/").get(getAllTrips).post(createTripValidator, createTrip)
router.route("/:id")
    .get(getTripValidator, getTrip)
    .put(updateTripValidator, updateTrip)
    .delete(deleteTripValidator, deleteTrip)
router.post("/checkavailability", checkavailability)
module.exports = router