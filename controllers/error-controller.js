const AppError = require('../utils/appError')


function sendErrorDev(err, res) {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}


function handleCastErrorDB(error) {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400)
}

function handleDuplicateFieldsDB(error) {
    console.log('dub')
    const message = `Duplicate field value: ${error.keyValue.name}. Please use another value!`;
    return new AppError(message, 400)
}

function handleValidationErrorDB(error) {
    const errors = Object.values(error.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400)
}

function handleJWTError(){
    const message = `Invalid token. Please login again!`;
    return new AppError(message, 401)
}

function handleJWTExpiredError(){
    const message = `Your token has expired. Please login again!`;
    return new AppError(message, 401)
}

function sendErrorProd(err, res) {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    } else {
        //1) Log error
        console.log(err);

        //2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        })
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV == 'development') {
        sendErrorDev(err, res)
    } else {
        let error = {...err}
        if (err.name == 'CastError') error = handleCastErrorDB(err);
        if (err.code == 11000) error = handleDuplicateFieldsDB(err);
        if (err.name == 'ValidationError') error = handleValidationErrorDB(err);
        if (err.name =='JsonWebTokenError ') error = handleJWTError();
        if (err.name == 'TokenExpiredError') {console.log('s');error = handleJWTExpiredError();}
        sendErrorProd(error, res)
    }


}