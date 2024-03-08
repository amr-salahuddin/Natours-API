const fs = require('fs');
const uuid = require('uuid');
const APIFeatures = require('../utils/apiFeatures');
const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour-controller');
const authController = require('../controllers/auth-controller');
//GET
router.get('/top-5-cheap', tourController.getTop5CheapTours, tourController.getAllTours);
router.get('/tours-stats', tourController.getToursStats);
router.get('/monthly-plan/:year', tourController.getMonthlyPlan);
router.get('/:id', tourController.getTour);
router.get('/', tourController.getAllTours);


//POST
router.post('/', authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.addTour);


router.patch('/:id', authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)


router.delete('/:id', authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)

module.exports = router;