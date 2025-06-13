const authRoutes = require('./authRoutes');
const userRouter = require('./userRouter');
const categoryRoutes = require('./categoryRoutes');
const tripRouter = require('./tripRouter');
const bookingRouter = require('./bookingRouter');
const orderRoutes = require('./orderRoutes');

const mountRoutes = (app) => {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/trips', tripRouter);
  app.use('/api/v1/bookings', bookingRouter);
  app.use('/api/v1/order', orderRoutes);
};

module.exports = mountRoutes;