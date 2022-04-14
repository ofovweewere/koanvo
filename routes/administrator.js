'use.strict'
let express = require('express');
let passport = require('passport'), 
LocalStrategy = require('passport-local').Strategy;
let router = express.Router();

let administratorController = require("../controllers/administratorController");

function requireAuth(req, res, next)
{
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    next();
}

/* GET - Display register auditor page - with /registerAuditor. */
router.get('/registerAuditor', administratorController.DisplayRegisterAuditorPage);
router.post('/registerAuditor', administratorController.ProcessRegisterAuditorPage);
router.get('/registerAdministrator', administratorController.DisplayRegisterAdministratorPage);
router.post('/registerAdministrator', administratorController.ProcessRegisterAdministratorPage);
router.get('/displayAdministratorHome', administratorController.DisplayAdministratorHome);
router.get('/displayAdministratorSearch', administratorController.DisplayAdministratorSearch);
router.post('/displayAdministratorSearch', administratorController.ProcessAdministratorSearchPage);
router.get('/blockTrainer/:user/', administratorController.DisplayBlockTrainer);
router.post('/blockTrainer/:user/', administratorController.ProcessBlockTrainer);
router.get('/unBlockTrainer/:user/', administratorController.DisplayUnblockTrainer);
router.post('/unBlockTrainer/:user/', administratorController.ProcessUnblockTrainer);
router.get('/blockSeeker/:user/', administratorController.DisplayBlockSeeker);
router.post('/blockSeeker/:user/', administratorController.ProcessBlockSeeker);
router.get('/unBlockSeeker/:user/', administratorController.DisplayUnblockSeeker);
router.post('/unBlockSeeker/:user/', administratorController.ProcessUnblockSeeker);
router.get('/blockAuditor/:user/', administratorController.DisplayBlockAuditor);
router.post('/blockAuditor/:user/', administratorController.ProcessBlockAuditor);
router.get('/unBlockAuditor/:user/', administratorController.DisplayUnblockAuditor);
router.post('/unBlockAuditor/:user/', administratorController.ProcessUnblockAuditor);
module.exports = router;