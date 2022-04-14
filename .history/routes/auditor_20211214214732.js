'use.strict'
let express = require('express');
let passport = require('passport'), 
LocalStrategy = require('passport-local').Strategy;
let router = express.Router();

let auditorController = require("../controllers/auditorController");

function requireAuth(req, res, next)
{
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    next();
}

/* GET - Display register auditor page - with /registerAuditor. */

router.get('/pendingTrainerJoinRequests', auditorController.DisplayPendingTrainerJoinRequests);
router.get('/displayTrainerRequestDetails/:username', auditorController.DisplayTrainerRequestDetails);
router.get('/photo/:certificate', auditorController.GetTrainerCertificate);
router.get('/processTrainerRequestDetails/approve/:username/', auditorController.ProcessTrainerRequestApproval);
router.get('/processTrainerRequestDetails/reject/:username/', auditorController.ProcessTrainerRequestRejection);
module.exports = router;