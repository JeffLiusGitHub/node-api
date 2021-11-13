"use strict";

var express = require("express");

var _require = require("express-validator"),
    body = _require.body;

var User = require("../models/user");

var authController = require("../controllers/auth");

var router = express.Router();

var isAuth = require('../middleware/is-auth');

router.put("/signup", [body("email").isEmail().withMessage("Please enter a valid email.").custom(function (value, _ref) {
  var req = _ref.req;
  return User.findOne({
    email: value
  }).then(function (userDoc) {
    if (userDoc) {
      return Promise.reject("E-mail address already exists!");
    }
  });
}).normalizeEmail(), body("password").trim().isLength({
  min: 5
}), body("name").trim().not().isEmpty()], authController.signup);
router.get('/status', isAuth, authController.getUserStatus);
router.post('/login', authController.login);
router.patch('/status', isAuth, [body('status').trim().not().isEmpty()], authController.updateUserStatus);
module.exports = router;