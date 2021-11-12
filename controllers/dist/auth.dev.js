"use strict";

var _require = require("express-validator/check"),
    validationResult = _require.validationResult;

var bcrypt = require("bcryptjs");

var User = require("../models/user");

var jwt = require("jsonwebtoken");

exports.signup = function (req, res, next) {
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    var error = new Error("validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  var email = req.body.email;
  var name = req.body.name;
  var password = req.body.password;
  bcrypt.hash(password, 12).then(function (hashPw) {
    var user = new User({
      email: email,
      password: hashPw,
      name: name
    });
    return user.save();
  }).then(function (result) {
    res.status(201).json({
      message: "User created",
      userId: result._id
    });
    console.log(result);
  })["catch"](function (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  });
};

exports.login = function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var loadedUser;
  User.findOne({
    email: email
  }).then(function (user) {
    if (!user) {
      var error = new Error("a user with this email could not be found");
      error.statusCode = 404;
      throw error;
    }

    loadedUser = user;
    return bcrypt.compare(password, user.password);
  }).then(function (isEqual) {
    if (!isEqual) {
      var error = new Error("wrong password!");
      error.statusCode = 401;
      throw error;
    }

    var token = jwt.sign({
      email: loadedUser.email,
      userId: loadedUser._id.toString()
    }, "secret", {
      expiresIn: "1h"
    });
    res.status(200).json({
      token: token,
      userId: loadedUser._id.toString()
    });
  })["catch"](function (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  });
};

exports.getUserStatus = function (req, res, next) {
  User.findById(req.userId).then(function (user) {
    if (!user) {
      var error = new Error("user not found!");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: user.status
    });
  })["catch"](function (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  });
};

exports.updateUserStatus = function (req, res, next) {
  var newUserStatus = req.body.status;
  User.findById(req.userId).then(function (user) {
    if (!user) {
      var error = new Error("cannot find user!");
      error.statusCode = 404;
      throw error;
    }

    user.status = newUserStatus;
    return user.save();
  }).then(function (result) {
    res.status(200).json({
      message: "user status updated"
    });
  })["catch"](function (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  });
};