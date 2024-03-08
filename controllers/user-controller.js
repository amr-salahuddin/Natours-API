const fs = require('fs');
const catchAsync = require("../utils/catchAsync");
const User = require('../models/user');


exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    });
})
exports.getUser = catchAsync(async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})


exports.updateMe = catchAsync(async (req, res) => {
    const {name, email} = req.body;
    const id = req.user._id;
    const newUser = {
        name ,
        email
    }

    const user = await User.findByIdAndUpdate(id, newUser, {
        new:true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })


})

exports.updateUser = catchAsync(async (req, res) => {
    const id = req.params.id;
    const newUser = req.body;
})
//DELETE

exports.deleteMe=catchAsync(async (req, res,next) => {

    const id = req.user._id;

    await User.findByIdAndUpdate(id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    })
})
exports.deleteUser = catchAsync(async (req, res) => {

    const id = req.params.id;
})

exports.deleteAllUsers = catchAsync(async (req, res) => {
    if(process.env.NODE_ENV === 'production') {
        return next(new AppError('This route is not available in production', 400))
    }

    await User.deleteMany();

    res.status(204).json({
        status: 'success',
        data: null
    })
})
