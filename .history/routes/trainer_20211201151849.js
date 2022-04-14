let express = require('express');
let passport = require('passport'), 
    LocalStrategy = require('passport-local').Strategy;
let router = express.Router();
let UserModel = require('../models/users');
let User = UserModel.User;

let trainerController = require("../controllers/trainerController");

function requireAuth(req, res, next)
{
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    next();
}

//router.get('/photoGallery');

//router.get('/profile', trainerController.renderIndex);
router.get('/schedule', trainerController.renderSchedule);
router.post('/schedule', trainerController.renderDetailedView);
//router.get('/schedule', requireAuth, trainerController.renderSchedule);
//router.post('/schedule', requireAuth, trainerController.renderDetailedView);
router.post('/setAppt', trainerController.renderSetAppt);
//router.post('/setAppt', requireAuth, trainerController.renderSetAppt);

/* GET - Display register seeker page - with /registerSeeker. */
router.get('/registerTrainer', trainerController.DisplayRegisterTrainerPage);
router.post('/registerTrainer',upload.single('myImage'), trainerController.ProcessRegisterTrainerPage);
module.exports = router;