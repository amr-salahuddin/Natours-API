//region modules
const uuid = require('uuid');
const fs = require("fs");
const morgan = require('morgan');
const AppError = require('./utils/appError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
//endregion
var express = require('express');
var app = express();

//region GLOBAL MIDDLEWARES
app.use(helmet());
app.use(morgan('dev'));
const limiter = rateLimit({
    max: 1,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
})
//allow only in production
if (process.env.NODE_ENV === 'production') {
    app.use('/api', limiter)
}
app.use(mongoSanitize());
app.use(xss());
//endregion
//10 bytes limit
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended: false}));
app.use(express.static(`${__dirname}/public`));
//endregion

//region routes
const toursRoute = require('./routes/tour-route');
const usersRoute = require('./routes/user-route');
const globalErrorHandler = require('./controllers/error-controller')
//endregion
app.use("/api/v1/tours", toursRoute);
app.use("/api/v1/users", usersRoute);
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})

app.use(globalErrorHandler);


module.exports = app;
