'use.strict'
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

const { Console } = require('console');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
const passport = require('passport'); 
LocalStrategy = require('passport-local').Strategy;
let url = require('url');
let UserModel = require('../models/users');
let User = UserModel.User;
const trainer_1 = require('../Utils/trainer');
let ApptModel = require('../models/appointment');
let Appt = ApptModel.Appointment;
let trainerController = require("../controllers/trainerController");
const multer_1 = __importDefault(require("multer"));
const moment_1 = __importDefault(require("moment"));
const fs_1 = __importDefault(require("fs"));
const db = mongoose.connection;
const q = __importDefault(require("q"));
const seekerExists = require("../Utils/checkIfSeekerUserNameExist");
const auditorExists = require("../Utils/checkIfAuditorUserNameExist");
const administratorExists = require("../Utils/checkIfAdministratorUserNameExist");

const tennisTrainer_1 = require("../models/tennisTrainer");



//render the schedule page
module.exports.renderSchedule = (req, res, next) => {
    //retreive the list of appts and send to the client
    Appt.find((err, mainList) => {
        if(err) {
            return console.error(err);
        }
        else {
            res.render('trainerViews/viewSchedule', { title : "Schedule", 
                list : mainList });
        }
    });
}
module.exports.renderSetAppt = (req, res, next) => {
    //find the user and check that there data
    let localAppt = new Appt({
        ApptTrainer : req.body.apptTrainer,
        ApptSeeker : req.body.apptSeek,
        ApptDate : req.body.apptDate,
        ApptLoc : req.body.apptLoc,
        ApptTime : req.body.apptTime
    });
    localAppt.save(function (err) {
        if(err) 
        {
            let mainList = req.body.list;
            console.log('error setting appt');
            res.redirect('schedule');
        }
    });
   
    res.redirect('schedule');
}
module.exports.renderDetailedView = (req, res, next) => {
    let apptDate = req.body.dateLookup;
    Appt.findById(apptDate, (err, date) => {
        if(err)
        {
            console.log(err);
        }
        else{
            console.log(date);
            res.render('seekerViews/detailedApptView', { title : 'details', appt : date }); 
                   
        }
    });

    
   
}

function DisplayRegisterTrainerPage(req, res, next) {
    if (!req.user) {
        return res.render('trainerViews/trainerIndex', { title: 'Register Trainer', page: 'registerTrainer', messages: req.flash('registerMessage'), displayName: (0, trainer_1.TrainerDisplayName)(req) });
    }
    return res.redirect('/tennis');
}
exports.DisplayRegisterTrainerPage = DisplayRegisterTrainerPage;

function ProcessRegisterTrainerPage(req, res, next) 
{
    const file = req.file;
    var img = fs_1.default.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    var finalImg = {
        contentType: req.file.mimetype,
        image: new Buffer(encode_image, 'base64'),
        certificate: file.filename
    };
    db.collection('certificates').insertOne(finalImg, (err, result) => {
        console.log(result);
        if (err)
            return console.log(err);
            
        console.log('saved to database');
    });
     // Delete the file like normal
     fs_1.default.unlinkSync(req.file.path);
     
    let ageCalculation = (0, moment_1.default)().diff(req.body.birthDate, 'years');
    let newUser2 = new tennisTrainer_1.default({
        hourlyRate: req.body.hourlyRate,
        aboutMe: req.body.aboutMe,
        certificate: file.filename,
        userType: "trainer",
        username: req.body.username,
        anyGender: "Any gender",
        emailAddress: req.body.emailAddress,
        age: ageCalculation,
        phoneNumber: req.body.phoneNumber,
        sex: req.body.sex,
        birthDate: req.body.birthDate,
        province: req.body.province,
        city: req.body.city,
        approvedByAuditor: "false",
        displayName: req.body.FirstName + " " + req.body.LastName,
        blocked: "false",
        administratorThatBlockedNotes: " ",
        administratorThatUnBlockedNotes: " ",
    });

    //Register trainer
    (0, seekerExists.checkIfSeekerNameIsTaken)(req).then(result =>{ 
        
        if(result === "true")
        {
            req.flash('registerMessage', 'Registration Error - user exists');
            return res.redirect('/trainer/registerTrainer');
        }
        else
        {
            (0, auditorExists.checkIfAuditorNameIsTaken)(req).then(result =>{ 
                console.log(result);
        
                if(result === "true")
                {
                    req.flash('registerMessage', 'Registration Error - user exists');
                    return res.redirect('/trainer/registerTrainer');
                }
                else
                {
                    (0, administratorExists.checkIfAdministratorNameIsTaken)(req).then(result =>{ 
                        
                
                        if(result === "true")
                        {
                            req.flash('registerMessage', 'Registration Error - user exists');
                            return res.redirect('/trainer/registerTrainer');
                        }
                        else
                        {
                            if(req.body.password != req.body.confirmPassword)
                            {
                                req.flash('registerMessage', 'Registration Error');
                                return res.redirect('/trainer/registerTrainer');
                            }
                            tennisTrainer_1.default.register(newUser2, req.body.password, (err) => {
        
                                if (err) {
                                    
                                    console.error('Error: Inserting New User');
                                    if (err.name == "UserExistsError") {
                                        req.flash('registerMessage', 'Registration Error');
                                    }
                                    console.log(err);
                                    console.log('Error: User Already Exists');
                                    return res.redirect("/trainer/registerTrainer");
                        
                                }
                                return passport.authenticate('trainerLocal')(req, res, () => {
                                    
                                    
                                    let username = req.body.username;
                                    let trainerRoute = '/trainer/displayTrainerHome/'+ `${username}`;
                                    return res.redirect(trainerRoute);
                                });
                                
                            });
                        }
                            
                    
                   
                    }) 
                }
                    
            
           
            }) 
           
        }
            
    
   
    })
    
}
exports.ProcessRegisterTrainerPage = ProcessRegisterTrainerPage;

function DisplayTrainerHome(req, res, next) {
    if(req.user.blocked === "true")
                {
                    
                    return res.redirect('/blocked');
                }
    var deferred = q.default.defer();
    let trainerName = req.params.username;
    tennisTrainer_1.default.find({
        "username": trainerName
    }, function (err, docs) {
        if (err) {
            console.log('Error Finding Files');
            deferred.reject(err);
        }
        else {
            let hourlyRate = " ";
            let aboutMe = " ";
            let emailAddress = " ";
            let displayName = " ";
            let phoneNumber = " ";
            let sex = " ";
            let age = " ";
            let province = " ";
            let city = " ";
            let approved = " ";
            docs.forEach(function fn(doc) {
                hourlyRate = `${doc.hourlyRate}`;
                aboutMe = `${doc.aboutMe}`;
                emailAddress = `${doc.emailAddress}`;
                displayName = `${doc.displayName}`;
                phoneNumber = `${doc.phoneNumber}`;
                sex = `${doc.sex}`;
                age = `${doc.age}`;
                province = `${doc.province}`;
                city = `${doc.city}`;
                approved = `${doc.approvedByAuditor}`;
            });
            deferred.resolve({
                hourlyRate: hourlyRate,
                aboutMe: aboutMe,
                emailAddress: emailAddress,
                displayName: displayName,
                phoneNumber: phoneNumber,
                sex: sex,
                age: age,
                province: province,
                city: city,
                approved: approved,
                respond: res.render('trainerViews/trainerIndex', { title: 'Trainer Page', page: 'trainerHome', approved: approved, city: city, province: province, age: age, sex: sex, hourlyRate: hourlyRate, aboutMe: aboutMe, emailAddress: emailAddress, displayNameFromQuery: displayName, phoneNumber: phoneNumber, username: trainerName, displayName: (0, trainer_1.TrainerDisplayName)(req) })
            });
        }
    });
}
exports.DisplayTrainerHome = DisplayTrainerHome;

module.exports.UpdateOrDeleteAccount = (req, res, next) => {
    res.render('trainerViews/trainerIndex', { title: "Update or Delete Account", page: 'updateOrDeleteAccount', displayName: (0, trainer_1.TrainerDisplayName)(req)});
}

function DeleteTrainerAccount(req, res, next) {
    let username = req.user.username;
    tennisTrainer_1.default.remove({ username: username }, (err) => {
        if (err) {
            console.error(err);
            res.end(err);
        }
        req.logout();
        res.redirect('/');
    });
}
exports.DeleteTrainerAccount = DeleteTrainerAccount;

function DisplayUpdatePersonalInformation(req, res, next) {
    res.render('trainerViews/trainerIndex', { title: 'Update your personal information', page: 'updatePersonalInformation',  user: req.user, displayName: (0, trainer_1.TrainerDisplayName)(req) })
                         
}
exports.DisplayUpdatePersonalInformation = DisplayUpdatePersonalInformation;

function ProcessUpdatePersonalInformation(req, res, next) {
    //store province and city information
    let province = req.body.province;
    let city = req.body.city;
    let sex = req.body.sex;
    let birthDate = req.body.birthDate;
    let user = req.user;
    if(province === "")
    {
       province = req.user.province;
       city = req.user.city;
    }

    if(city === "")
    {
        console.log("city is empty");
        city = req.user.city;
        
    }

    if(sex === "")
    {
        console.log("sex is empty");
        sex = req.user.sex;
        
    }

    if(birthDate === "")
    {
        console.log("birthdate is empty");
        birthDate = req.user.birthDate;
        
    }
    console.log(req.body.birthDate);
    let ageCalculation = (0, moment_1.default)().diff(birthDate, 'years');
    user.displayName = req.body.displayName;
    user.phoneNumber = req.body.phoneNumber;
    user.province = province;
    user.city = city;
    user.emailAddress = req.body.emailAddress;
    user.sex = sex;
    user.age = ageCalculation;
    user.hourlyRate= req.body.hourlyRate;
    user.aboutMe = req.body.aboutMe;
    user.save();
    let trainerRoute = '/trainer/displayTrainerHome/'+ `${req.user.username}`;
    return res.redirect(trainerRoute);
}
exports.ProcessUpdatePersonalInformation = ProcessUpdatePersonalInformation;