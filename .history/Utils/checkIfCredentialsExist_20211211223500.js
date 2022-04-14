"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateIndex = void 0;
  // refer to trainer DB
  const TrainerModel=require('../models/tennisTrainer')
  const Trainer=TrainerModel.Trainer
  const trainer_1 = require('../Utils/trainer');
  const seeker_1 = require('../Utils/index');
  //refer to auditor DB
  const AuditorModel=require('../models/auditor')
  const Auditor=AuditorModel.Auditor
  
  //refer to administrator DB
  const AdministratorModel=require('../models/administrator')
  const Administrator=AdministratorModel.Administrator
  
  //refer to auditor DB
  const TrainerSeekerModel=require('../models/tennisTrainerSeeker')
  const TrainerSeeker=TrainerSeekerModel.Trainer
function checkIfUserNameIsTaken(req) {
  
let username = req.body.username;
TrainerModel.default.find({emailAddress:req.query.user_email}, (err, trainers)=>{
    if(err){
        return res.send('-2') // server error
    }else if(!trainers[0]){
        return res.send('0') // no such user
    }else{
        // find user and ready to recover password email
        //send an email to my email
        const options = {
            from        : '"My Personal Website" <wangxiaobei666@hotmail.com>',
            to          : req.query.user_email,
            subject        : 'An email from G5-S4-F21/ACME',
            // text          : 'An email from my website',

            html           : '<h4>Please click the link below to reset your password</h4><p>' +
                '<p>From: G5-S4-F21/ACME</p>' +
                '<p><a href="http://localhost:3000/recoverPassword?accountType='+req.query.user_account_type+'&UUID='+trainers[0]._id+'">http://localhost:3000/recoverPassword?accountType='+req.query.user_account_type+'&UUID='+trainers[0]._id+'</a>'
        };

        mailTransport.sendMail(options, function(err, msg){
            if(err){
                console.log(err);
                res.render('index', { title: err, page: 'defaultHome', userInfo });
            }
            else {
                console.log(msg);
                res.render('index', { title: "Received："+msg.accepted, page: 'defaultHome', userInfo});
            }
        })
    }
})
    
}
exports.checkIfUserNameIsTaken = checkIfUserNameIsTaken;
//# sourceMappingURL=checkIfUserNameIsTaken.js.map