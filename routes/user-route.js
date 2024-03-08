const fs = require('fs');
const uuid = require('uuid');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');
const authController = require('../controllers/auth-controller');


router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)
router.patch('/updatePassword/', authController.protect, authController.updatePassword)

router.get('/', userController.getAllUsers)

router.get('/:id', userController.getUser);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.patch('/:id', userController.updateUser);
router.delete('/',authController.protect, userController.deleteMe)
router.delete('/all', userController.deleteAllUsers)

router.delete('/:id', userController.deleteUser)

module.exports = router;
