const { Console } = require('console');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;
let url = require('url');
const { v4: uuidv4 } = require('uuid');
let nodemailer = require('nodemailer');
// refer to user DB
let UserModel = require('../models/users');
let User = UserModel.User;

// refer to trainer DB
const TrainerModel = require('../models/tennisTrainer');
const Trainer = TrainerModel.Trainer;
const trainer_1 = require('../Utils/trainer');
const seeker_1 = require('../Utils/index');
//refer to auditor DB
const AuditorModel = require('../models/auditor');
const Auditor = AuditorModel.Auditor;

//refer to administrator DB
const AdministratorModel = require('../models/administrator');
const Administrator = AdministratorModel.Administrator;

//refer to seeker DB
const tennisTrainerSeeker = require('../models/tennisTrainerSeeker');
const TrainerSeekerModel = require('../models/tennisTrainerSeeker');
const TrainerSeeker = TrainerSeekerModel.Trainer;

const mailTransport = nodemailer.createTransport({
  service: 'Hotmail',
  auth: {
    user: 'wangxiaobei666@hotmail.com',
    pass: '13ULovEi14962464',
  },
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ uname: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'in' });
      }
      return done(null, user);
    });
  })
);

//should render ../views/index.ejs//
module.exports.renderIndex = (req, res, next) => {
  if (req.user) {
    res.json({ message: req.user.administratorThatUnBlockedNotes, success: true });
    /*
        res.json({"obj": [
            {
              "name": 'John',
              "online": true
            },
            {
              "name": 'Wiz',
              "online": false
            },
            {
              "name": 'Sasha',
              "online": true
            },
            {
                "name": 'Sasha',
                "online": true
              },
            {
                "name": 'Fela',
                "online": true}
           
          ]});
          */
  } else {
    res.json({ message: 'Who are you?', success: false });
  }
};

//should render ../views/index.ejs//
module.exports.isLoggedIn = (req, res, next) => {
  if (req.user) {
    /*
        console.log(req.accepts(['html', 'json']), "hey hey");
        if(req.accepts(['html', 'json']))
        {
            console.log("DAPOOOOOOOOOOOKANYEEEEEEEEEEEE");
        }
        else
        {
            console.log("CHRISBREEEZZZZZZZZZZZZZZZZZZZZY");
        }
        */
    switch (
      req.accepts(['html', 'json']) //possible response types, in order of preference
    ) {
      case 'html':
        // respond with HTML
        res.status(400).send('Bad Request');
        break;
      case 'json':
        res.json({ status: true, username: req.user.username });
        // respond with JSON
        break;
      default:
        // if the application requested something we can't support
        res.status(400).send('Bad Request');
        return;
    }
  } else {
    res.json({ status: false });
  }
};

//should render blocked
module.exports.renderBlocked = (req, res, next) => {
  req.logout();
  res.render('index', { title: 'Suspended account', page: 'suspendedAccount' });
};

module.exports.createAccount = (req, res, next) => {
  res.render('index', { title: 'Create Account', page: 'createAccount' });
};
/**
 * create an account
 * @param req
 * @param res
 * @param next
 */
module.exports.handleCreateAccount = (req, res, next) => {
  // based on type of account, create an account
  const { user_account_type } = req.body;
  switch (user_account_type) {
    case 'trainer_seeker':
      // register trainer seeker
      console.log('handle trainer seeker DB');
      break;
    case 'trainer':
      //register trainer seek
      registerTrainer(req, res);
      break;
    case 'auditor':
      //register trainer seek
      console.log('handle auditor DB');
      break;
    default:
      break;
  }
};

/**
 * register trainer
 * @param req
 * @param res
 */
const registerTrainer = (req, res) => {
  console.log(req.body);
  Trainer.find({ trainerEmail: req.body.user_email }, (err, trainer_seekers) => {
    if (err) {
      console.log(err);
      res.redirect('/createAccount');
      return res.send('-2'); // server err
    }

    if (trainer_seekers[0]) {
      res.redirect('/createAccount');
      return res.send('1'); // trainer seeker already exists
    } else {
      // can register
      let trainerSeeker = new Trainer({
        trainerEmail: req.body.user_email,
        trainerPassword: req.body.user_password,
        trainerCellphone: req.body.user_cellphone_number,
      });

      trainerSeeker.save().then(() => {
        // save session
        req.session.user_email = req.body.user_email;
        req.session.user_password = req.body.user_password;
        req.session.user_account_type = req.body.user_account_type;
        res.redirect('/');
        return res.send('0');
      });
    }
  });
};

function DisplayLoginPage(req, res, next) {
  console.log(req, 'from browser ');
  if (req.user) {
    if (req.user.userType === 'seeker') {
      return res.redirect('/seeker/displaySeekerHome');
    }
  }

  if (!req.user) {
    return res.render('index', {
      title: 'Login',
      page: 'login',
      messages: req.flash('loginMessage'),
    });
  }

  return res.redirect('/');
}
exports.DisplayLoginPage = DisplayLoginPage;

function ProcessLoginPage(req, res, next) {
  console.log(req, 'from angular');
  //handle login for tennis trainer seeker
  if (req.user) {
    console.log('user is', req.user.displayName);
  }
  passport.authenticate('seekerLocal', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (!user) {
      req.flash('loginMessage', 'Authentication Error');
      // return res.redirect('/login');
      return res.json({ username: 'non', success: false });
    }
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return next(err);
      }

      //return res.redirect('/seeker/displaySeekerHome');
      res.json({ username: user.username, success: true });
    });
  })(req, res, next);
}
exports.ProcessLoginPage = ProcessLoginPage;

function ProcessQuotePage(req, res, next) {
  console.log(req.user.username, req.body.value);
  req.user.administratorThatUnBlockedNotes = req.body.value;
  req.user.save();
  res.json({ success: true, message: req.body.value });
}
exports.ProcessQuotePage = ProcessQuotePage;

function ProcessRegisterPage(req, res, next) {
  let newUser = new tennisTrainerSeeker.default({
    userType: 'seeker',
    username: req.body.username,
    emailAddress: req.body.emailAddress,
    displayName: req.body.user + ' ' + 'test',
    blocked: 'false',
    administratorThatBlockedNotes: ' ',
    administratorThatUnBlockedNotes: ' ',
  });

  tennisTrainerSeeker.default.register(newUser, req.body.password, (err) => {
    if (err) {
      /*
            console.error('Error: Inserting New User');
            if (err.name == "UserExistsError") {
               req.flash('registerMessage', 'Registration Error');
                return res.json({"username": "non", "success": false});
            }
            console.log(err);
            console.log('Error: User Already Exists');
            return res.redirect('/seeker/registerSeeker');
            */
      //req.flash('registerMessage', 'Registration Error');
      return res.json({ username: 'non', success: false });
    }
    return passport.authenticate('seekerLocal')(req, res, () => {
      //return res.redirect('/seeker/displaySeekerHome');
      return res.json({ username: user.username, success: true });
    });
  });
}
exports.ProcessRegisterPage = ProcessRegisterPage;

function ProcessLogoutPage(req, res, next) {
  req.logout();

  res.json({ success: true });
}
exports.ProcessLogoutPage = ProcessLogoutPage;

/**
 * render reset password page
 * @param req
 * @param res
 * @param next
 */
module.exports.renderForgetPasswordView = (req, res, next) => {
  const userInfo = {
    user_email: req.session.user_email,
    user_password: req.session.user_password,
    user_account_type: req.session.user_account_type,
  };
  res.render('index', {
    title: 'Recover password',
    page: 'forgetPasswordView',
    userInfo,
  });
};

/**
 * send reset password email
 * @param req
 * @param res
 * @param next
 */
module.exports.sendRecoverPasswordEmail = (req, res, next) => {
  const { user_account_type } = req.query;
  const userInfo = {
    user_email: req.session.user_email,
    user_password: req.session.user_password,
    user_account_type: req.session.user_account_type,
  };
  switch (user_account_type) {
    case 'Trainer':
      // find from Trainer DB
      findTrainerByEmail(req, res);
      break;
    case 'Trainer Seeker':
      // find from Trainer Seeker DB
      findTrainerSeekerByEmail(req, res);
      break;
    case 'Auditor':
      //find from Auditor DB
      findAuditorByEmail(req, res);
      break;
    case 'Admin':
      //find from Admin DB
      findAdministratorByEmail(req, res);
      break;
      break;
    default:
      break;
  }
};

/**
 * find trainer by email
 * @param req
 * @param res
 */
const findTrainerByEmail = (req, res) => {
  const userInfo = {
    user_email: req.session.user_email,
    user_password: req.session.user_password,
    user_account_type: req.session.user_account_type,
  };
  TrainerModel.default.find({ emailAddress: req.query.user_email }, (err, trainers) => {
    if (err) {
      return res.send('-2'); // server error
    } else if (!trainers[0]) {
      return res.send('0'); // no such user
    } else {
      // find user and ready to recover password email
      //send an email to my email
      const options = {
        from: '"My Personal Website" <wangxiaobei666@hotmail.com>',
        to: req.query.user_email,
        subject: 'An email from G5-S4-F21/ACME',
        // text          : 'An email from my website',

        html:
          '<h4>Please click the link below to reset your password</h4><p>' +
          '<p>From: G5-S4-F21/ACME</p>' +
          '<p><a href=https://lawntennistrainer.herokuapp.com/recoverPassword?accountType=' +
          req.query.user_account_type +
          '&UUID=' +
          trainers[0]._id +
          '">https://lawntennistrainer.herokuapp.com/recoverPassword?accountType=' +
          req.query.user_account_type +
          '&UUID=' +
          trainers[0]._id +
          '</a>',
      };

      mailTransport.sendMail(options, function (err, msg) {
        if (err) {
          console.log(err);
          res.render('index', { title: err, page: 'defaultHome', userInfo });
        } else {
          console.log(msg);
          res.render('index', {
            title: 'Received：' + msg.accepted,
            page: 'defaultHome',
            userInfo,
          });
        }
      });
    }
  });
};

/**
 * find auditor by email
 * @param req
 * @param res
 */
const findAuditorByEmail = (req, res) => {
  const userInfo = {
    user_email: req.session.user_email,
    user_password: req.session.user_password,
    user_account_type: req.session.user_account_type,
  };
  AuditorModel.default.find({ emailAddress: req.query.user_email }, (err, auditors) => {
    if (err) {
      return res.send('-2'); // server error
    } else if (!auditors[0]) {
      return res.send('0'); // no such user
    } else {
      // find user and ready to recover password email
      //send an email to my email
      const options = {
        from: '"My Personal Website" <wangxiaobei666@hotmail.com>',
        to: req.query.user_email,
        subject: 'An email from G5-S4-F21/ACME',
        // text          : 'An email from my website',

        html:
          '<h4>Please click the link below to reset your password</h4><p>' +
          '<p>From: G5-S4-F21/ACME</p>' +
          '<p><a href="https://lawntennistrainer.herokuapp.com/recoverPassword?accountType=' +
          req.query.user_account_type +
          '&UUID=' +
          auditors[0]._id +
          '">https://lawntennistrainer.herokuapp.com/recoverPassword?accountType=' +
          req.query.user_account_type +
          '&UUID=' +
          auditors[0]._id +
          '</a>',
      };

      mailTransport.sendMail(options, function (err, msg) {
        if (err) {
          console.log(err);
          res.render('index', { title: err, page: 'defaultHome', userInfo });
        } else {
          console.log(msg);
          res.render('index', {
            title: 'Received：' + msg.accepted,
            page: 'defaultHome',
            userInfo,
          });
        }
      });
    }
  });
};

/**
 * find administrator by email
 * @param req
 * @param res
 */
const findAdministratorByEmail = (req, res) => {
  const userInfo = {
    user_email: req.session.user_email,
    user_password: req.session.user_password,
    user_account_type: req.session.user_account_type,
  };
  AdministratorModel.default.find({ emailAddress: req.query.user_email }, (err, administrators) => {
    if (err) {
      return res.send('-2'); // server error
    } else if (!administrators[0]) {
      return res.send('0'); // no such user
    } else {
      // find user and ready to recover password email
      //send an email to my email
      const options = {
        from: '"My Personal Website" <wangxiaobei666@hotmail.com>',
        to: req.query.user_email,
        subject: 'An email from G5-S4-F21/ACME',
        // text          : 'An email from my website',

        html:
          '<h4>Please click the link below to reset your password</h4><p>' +
          '<p>From: G5-S4-F21/ACME</p>' +
          '<p><a href="https://lawntennistrainer.herokuapp.com/recoverPassword?accountType=' +
          req.query.user_account_type +
          '&UUID=' +
          administrators[0]._id +
          '">https://lawntennistrainer.herokuapp.com/recoverPassword?accountType=' +
          req.query.user_account_type +
          '&UUID=' +
          administrators[0]._id +
          '</a>',
      };

      mailTransport.sendMail(options, function (err, msg) {
        if (err) {
          console.log(err);
          res.render('index', { title: err, page: 'defaultHome', userInfo });
        } else {
          console.log(msg);
          res.render('index', {
            title: 'Received：' + msg.accepted,
            page: 'defaultHome',
            userInfo,
          });
        }
      });
    }
  });
};

/**
 * find trainer seeker by email
 * @param req
 * @param res
 */
const findTrainerSeekerByEmail = (req, res) => {
  const userInfo = {
    user_email: req.session.user_email,
    user_password: req.session.user_password,
    user_account_type: req.session.user_account_type,
  };
  TrainerSeekerModel.default.find({ emailAddress: req.query.user_email }, (err, seekers) => {
    if (err) {
      return res.send('-2'); // server error
    } else if (!seekers[0]) {
      return res.send('0'); // no such user
    } else {
      // find user and ready to recover password email
      //send an email to my email
      const options = {
        from: '"My Personal Website" <wangxiaobei666@hotmail.com>',
        to: req.query.user_email,
        subject: 'An email from G5-S4-F21/ACME',
        // text          : 'An email from my website',

        html:
          '<h4>Please click the link below to reset your password</h4><p>' +
          '<p>From: G5-S4-F21/ACME</p>' +
          '<p><a href="https://lawntennistrainer.herokuapp.com/recoverPassword?accountType=' +
          req.query.user_account_type +
          '&UUID=' +
          seekers[0]._id +
          '">https://lawntennistrainer.herokuapp.com/recoverPassword?accountType=' +
          req.query.user_account_type +
          '&UUID=' +
          seekers[0]._id +
          '</a>',
      };

      mailTransport.sendMail(options, function (err, msg) {
        if (err) {
          console.log(err);
          res.render('index', { title: err, page: 'defaultHome', userInfo });
        } else {
          console.log(msg);
          res.render('index', {
            title: 'Received：' + msg.accepted,
            page: 'defaultHome',
            userInfo,
          });
        }
      });
    }
  });
};
/**
 * render reset password view
 * @param req
 * @param res
 * @param next
 */
module.exports.renderResetPasswordView = (req, res, next) => {
  // console.log(req.query.accountType,req.query.UUID)
  const userInfo = {};
  console.log(req.query.accountType);
  res.render('index', {
    title: 'Reset password',
    page: 'resetPasswordView',
    account_type: req.query.accountType.replace(' ', ''),
    UUID: req.query.UUID,
    userInfo,
  });
};

/**
 * reset password by account type and UUID
 * @param req
 * @param res
 * @param next
 */
module.exports.resetPasswordByAccountTypeAndUUID = (req, res, next) => {
  const { account_type } = req.body;
  console.log(account_type);
  // find this user by account type and UUID
  switch (account_type) {
    case 'Trainer':
      // find this user in trainer DB by UUID
      findTrainerByUUID(req, res);
      break;
    case 'TrainerSeeker':
      // find this user in trainer seeker DB by UUID
      findTrainerSeekerByUUID(req, res);
      break;
    case 'Auditor':
      //find this user in Auditor DB by UUID
      findAuditorByUUID(req, res);
      break;
    case 'Admin':
      //find this user in Administrator DB by UUID
      findAdministratorByUUID(req, res);
      break;
    case 'TrainerUpdate':
      // find this user in trainer DB by UUID
      findAndUpdateTrainerByUUID(req, res);
      break;

    case 'SeekerUpdate':
      // find this user in trainer DB by UUID
      findAndUpdateSeekerByUUID(req, res);
      break;
    default:
      break;
  }
};

/**
 * find the trainer by UUID
 * @param req
 * @param res
 */
const findTrainerByUUID = (req, res) => {
  const NewPass = req.body.new_password,
    confirm_password = req.body.new_password;
  console.log(NewPass);
  if (NewPass == confirm_password) {
    console.log(NewPass);
    TrainerModel.default.findById(req.body.UUID, (err, user) => {
      if (err) console.log(err);
      else {
        user.setPassword(NewPass, (err, user) => {
          if (err) {
            // -2: server error
            return res.send('-2');
          }
          if (!user) {
            // 0: no such user
            return res.send('0');
          } else {
            // reset password
            user.save();
            console.log('updated!');
            req.logout();
            return res.send('1');
          }
        });
      }
    });
  }
};

/**
 * find the auditor by UUID
 * @param req
 * @param res
 */
const findAuditorByUUID = (req, res) => {
  const NewPass = req.body.new_password,
    confirm_password = req.body.new_password;
  console.log(NewPass);
  if (NewPass == confirm_password) {
    console.log(NewPass);
    AuditorModel.default.findById(req.body.UUID, (err, user) => {
      if (err) console.log(err);
      else {
        user.setPassword(NewPass, (err, user) => {
          if (err) {
            // -2: server error
            return res.send('-2');
          }
          if (!user) {
            // 0: no such user
            return res.send('0');
          } else {
            // reset password
            user.save();
            console.log('updated!');
            return res.send('1');
          }
        });
      }
    });
  }
};

/**
 * find the administrator by UUID
 * @param req
 * @param res
 */
const findAdministratorByUUID = (req, res) => {
  const NewPass = req.body.new_password,
    confirm_password = req.body.new_password;

  if (NewPass == confirm_password) {
    AdministratorModel.default.findById(req.body.UUID, (err, user) => {
      if (err) console.log(err);
      else {
        user.setPassword(NewPass, (err, user) => {
          if (err) {
            // -2: server error
            return res.send('-2');
          }
          if (!user) {
            // 0: no such user
            return res.send('0');
          } else {
            // reset password
            user.save();
            console.log('updated!');
            return res.send('1');
          }
        });
      }
    });
  }
};

/**
 * find the seeker by UUID
 * @param req
 * @param res
 */
const findTrainerSeekerByUUID = (req, res) => {
  const NewPass = req.body.new_password,
    confirm_password = req.body.new_password;
  console.log(NewPass);
  if (NewPass == confirm_password) {
    console.log(NewPass);
    TrainerSeekerModel.default.findById(req.body.UUID, (err, user) => {
      if (err) console.log(err);
      else {
        user.setPassword(NewPass, (err, user) => {
          if (err) {
            // -2: server error
            return res.send('-2');
          }
          if (!user) {
            // 0: no such user
            return res.send('0');
          } else {
            // reset password
            user.save();
            console.log('updated!');
            return res.send('1');
          }
        });
      }
    });
  }
};

/**
 * render trainer change password view
 * @param req
 * @param res
 * @param next
 */
module.exports.renderChangePasswordView = (req, res, next) => {
  // console.log(req.query.accountType,req.query.UUID)
  let userType = req.user.userType;
  let userTypeToChangePassword = '';
  let pageToProcess = '';
  const userInfo = {};
  if (userType === 'trainer') {
    userTypeToChangePassword = 'TrainerUpdate';
    pageToProcess = 'changePasswordView';
    res.render('trainerViews/trainerIndex', {
      title: 'Reset password',
      page: pageToProcess,
      account_type: userTypeToChangePassword,
      UUID: req.query.UUID,
      displayName: (0, trainer_1.TrainerDisplayName)(req),
      userInfo,
    });
  } else if (userType === 'seeker') {
    userTypeToChangePassword = 'SeekerUpdate';
    pageToProcess = 'changeSeekerPasswordView';
    res.render('seekerViews/seekerIndex', {
      title: 'Reset password',
      page: pageToProcess,
      account_type: userTypeToChangePassword,
      UUID: req.query.UUID,
      displayName: (0, seeker_1.UserDisplayName)(req),
      userInfo,
    });
  }
};

/**
 * find and update the trainer by UUID
 * @param req
 * @param res
 */
const findAndUpdateTrainerByUUID = (req, res) => {
  const OldPass = req.body.old_password;
  const NewPass = req.body.new_password;
  confirm_password = req.body.new_password;
  if (NewPass == confirm_password) {
    TrainerModel.default.findById(req.user._id, (err, user) => {
      if (err) console.log(err);
      else {
        // Password verification
        user.authenticate(OldPass, function (err, model, passwordError) {
          if (passwordError) {
            console.log(err);
            return res.send('-3');
          } else if (model) {
            console.log(`correct password ${model}`);
            user.setPassword(NewPass, (err, user) => {
              if (err) {
                // -2: server error
                return res.send('-2');
              }
              if (!user) {
                // 0: no such user
                return res.send('0');
              } else {
                // reset password
                user.save();
                console.log('updated!');
                res.send('1');
                return res.render('trainerViews/trainerIndex', {
                  title: 'Update or Delete Account',
                  page: 'updateOrDeleteAccount',
                  displayName: (0, trainer_1.TrainerDisplayName)(req),
                });
              }
            });
          }
        });
      }
    });
  }
};

/**
 * find and update the seeker by UUID
 * @param req
 * @param res
 */
const findAndUpdateSeekerByUUID = (req, res) => {
  const OldPass = req.body.old_password;
  const NewPass = req.body.new_password;
  confirm_password = req.body.new_password;
  if (NewPass == confirm_password) {
    TrainerSeekerModel.default.findById(req.user._id, (err, user) => {
      if (err) console.log(err);
      else {
        // Password verification
        user.authenticate(OldPass, function (err, model, passwordError) {
          if (passwordError) {
            console.log(err);
            return res.send('-3');
          } else if (model) {
            console.log(`correct password ${model}`);
            user.setPassword(NewPass, (err, user) => {
              if (err) {
                // -2: server error
                return res.send('-2');
              }
              if (!user) {
                // 0: no such user
                return res.send('0');
              } else {
                // reset password
                user.save();
                console.log('updated!');
                res.send('1');
                return res.render('seekerViews/seekerIndex', {
                  title: 'Update or Delete Account',
                  page: 'updateOrDeleteAccount',
                  displayName: (0, seeker_1.UserDisplayName)(req),
                });
              }
            });
          }
        });
      }
    });
  }
};
