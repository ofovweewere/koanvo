"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = exports.AdministratorDisplayName = void 0;
function AdministratorDisplayName(req) {
    if (req.user) {
        let user = req.user;
        return user.displayName.toString();
    }
    return '';
}
exports.AdministratorDisplayName = AdministratorDisplayName;
function AuthGuard(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}
exports.AuthGuard = AuthGuard;
