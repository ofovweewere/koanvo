"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateIndex = void 0;
function checkIfUserNameIsTaken(req) {
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
    
}
exports.checkIfUserNameIsTaken = checkIfUserNameIsTaken;
//# sourceMappingURL=checkIfUserNameIsTaken.js.map