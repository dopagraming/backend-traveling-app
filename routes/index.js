const tripRouter = require("./tripRouter")
const userRouter = require("./userRouter")
const authRouter = require("./authRoutes")
const orderRouter = require("./orderRoutes")
const bookingRouter = require("./bookingRouter")
const categoryRouter = require("./categoryRoutes")
const mountRoutes = (app) => {
    app.use("/api/v1/trips", tripRouter);
    app.use("/api/v1/users", userRouter)
    app.use("/api/v1/auth", authRouter)
    app.use("/api/v1/order", orderRouter)
    app.use("/api/v1/bookings", bookingRouter)
    app.use("/api/v1/categories", categoryRouter)
}

module.exports = mountRoutes