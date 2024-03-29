const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const util = require('util');
const sendEmail = require('../utils/email');
const verifyAsync = util.promisify(jwt.verify);
const crypto = require('crypto');
const verifyToken = async (token) => {

    return await verifyAsync(token, process.env.JWT_SECRET);

}

function createSendToken(user, statusCode, res) {
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN),
        httpOnly: true,
        //secure in production
        secure: process.env.NODE_ENV === 'production'
    }

    user.password = undefined;
    res.cookie('jwt', token, cookieOptions);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}


function signToken(id) {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: Date.now(),
        role: req.body.role
    }
    const user = await User.create(userData);

    createSendToken(user, 201, res);



})

exports.login = catchAsync(async (req, res, next) => {
    let {email, password} = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    email = {"$gt":""};
    const user = await User.findOne({email}).select('+password');
    console.log(user);
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);
    //return user without password

    user.password = undefined;
    createSendToken(user, 200, res);

})

exports.protect = catchAsync(async (req, res, next) => {
    console.log('hi')
    let token;

    // 1) Getting token and check of it's there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.log('????');

        return next(new AppError('You are not logged in! Please log in to get access', 401));
    }
    //2) Verification token
    let decoded;
    decoded = await verifyToken(token);


    //3) Check if user still exists
    const user = await User.findById(decoded.id);

    if (!user) {
        return next(new AppError('The user belonging to this token does no longer exist', 401));
    }

    //4) Check if user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again', 401));
    }


    req.user = user;

    next();


});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        const currentRole = req.user.role

        if (!roles.includes(currentRole)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next()
    }

}


exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new AppError('There is no user with that email address', 404));
    }

    //2) Generate the random reset token

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    //3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        });


        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    } catch (e) {
        user.passwordResetToken = undefined;
        user.passwordExpires = undefined
        await user.save({validateBeforeSave: false});
        console.log(e);
        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const {password, passwordConfirm} = req.body;

    if (!password || !passwordConfirm) {
        return next(new AppError('Please provide password and passwordConfirm', 400));
    }
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    console.log(hashedToken, req.params.token);
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
})

exports.updatePassword = catchAsync(async (req, res, next) => {

    console.log('hi')
    const {oldPassword, password, passwordConfirm} = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(oldPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;

    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    })

})

