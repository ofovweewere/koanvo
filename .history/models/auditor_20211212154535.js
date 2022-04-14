"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const passport_local_mongoose_1 = __importDefault(require("passport-local-mongoose"));
const UserSchema = new Schema({
    userType: String,
    username: String,
    emailAddress: String,
    displayName: String,
    blocked: String,
    administratorThatBlockedNotes: String,
    administratorThatUnBlockedNotes: String,
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date,
        default: Date.now()
    }
}, {
    collection: "auditor"
});
UserSchema.plugin(passport_local_mongoose_1.default);
const Model = mongoose_1.default.model("Auditor", UserSchema);
exports.default = Model;
//# sourceMappingURL=auditor.js.map