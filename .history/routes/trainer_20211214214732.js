var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
let express = require('express');
let passport = require('passport'), 
    LocalStrategy = require('passport-local').Strategy;
let router = express.Router();

let UserModel = require('../models/users');
let User = UserModel.User;
const multer_1 = __importDefault(require("multer"));
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});


var upload = (0, multer_1.default)({ storage: storage });
let trainerController = require('../controllers/trainerController');

function requireAuth(req, res, next)
{
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    next();
}


router.get('/schedule', trainerController.renderSchedule);
router.post('/schedule', trainerController.renderDetailedView);
router.post('/setAppt', trainerController.renderSetAppt);
router.get('/registerTrainer', trainerController.DisplayRegisterTrainerPage);
router.post('/registerTrainer',upload.single('Certificate'),trainerController.ProcessRegisterTrainerPage) ;
router.get('/displayTrainerHome/:username', trainerController.DisplayTrainerHome);
router.get('/updateOrDeleteAccount/', trainerController.UpdateOrDeleteAccount);
router.get('/deleteTrainer/', trainerController.DeleteTrainerAccount);
router.get('/displayUpdatePersonalInformation/', trainerController.DisplayUpdatePersonalInformation);
router.post('/displayUpdatePersonalInformation/', trainerController.ProcessUpdatePersonalInformation);
module.exports = router;