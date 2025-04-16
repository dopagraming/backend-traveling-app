const path = require("path")
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");
const dbConnecion = require("./config/database");
const apiError = require("./utils/apiError");
const errorMiddleware = require("./middlewares/errorMiddleware");
const mountRoutes = require("./routes");
const { webhookCheckout } = require('./services/orderServices');

dotenv.config({ path: "config.env" });

const app = express();


app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);

app.use(express.json());



app.use(express.static(path.join(__dirname, 'uploads')))

dbConnecion();



app.use(cors());
app.options('*', cors());

app.use(compression());





mountRoutes(app)


app.all("*", (req, res, next) => {
  next(new apiError(`Can't Find This route : ${req.originalUrl}`, 400));
});

app.use(errorMiddleware);
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log("App runnig");
});

process.on('unhandledRejection', (err) => {
  console.log(`unhandledRejection ${err}`)
  server.close(() => {
    console.log("shutting down ....");
    process.exit(1)
  })
})

