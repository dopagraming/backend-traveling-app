const apiError = require("../utils/apiError");

const globalError = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === 'production') {
        sendErrorForProd(err, res);
    } else {
        if (err.name == "JsonWebTokenError") err = handleJwtInvalidSignature()
        if (err.name == "TokenExpiredError") err = handleJwtExpired()
        sendErrorForDev(err, res);
    }
}
const sendErrorForDev = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
}
const sendErrorForProd = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
}

const handleJwtInvalidSignature = () =>
    new apiError("Invalid Token, please Login again..", 401)

const handleJwtExpired = () =>
    new apiError("Expired Token, please Login again..", 401)
module.exports = globalError