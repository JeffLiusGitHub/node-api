"use strict";

var _require = require("express-validator"),
    validationResult = _require.validationResult;

var bcrypt = require("bcryptjs");

var User = require("../models/user");

var jwt = require("jsonwebtoken");

exports.signup = function _callee(req, res, next) {
  var errors, error, email, name, password, hashPw, user;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          errors = validationResult(req);

          if (errors.isEmpty()) {
            _context.next = 6;
            break;
          }

          error = new Error("validation failed");
          error.statusCode = 422;
          error.data = errors.array();
          throw error;

        case 6:
          email = req.body.email;
          name = req.body.name;
          password = req.body.password;
          _context.prev = 9;
          _context.next = 12;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 12));

        case 12:
          hashPw = _context.sent;
          user = new User({
            email: email,
            password: hashPw,
            name: name
          });
          _context.next = 16;
          return regeneratorRuntime.awrap(user.save());

        case 16:
          _context.next = 18;
          return regeneratorRuntime.awrap(res.status(201).json({
            message: "User created",
            userId: result._id
          }));

        case 18:
          _context.next = 24;
          break;

        case 20:
          _context.prev = 20;
          _context.t0 = _context["catch"](9);

          if (!_context.t0.statusCode) {
            _context.t0.statusCode = 500;
          }

          next(_context.t0);

        case 24:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[9, 20]]);
};

exports.login = function _callee2(req, res, next) {
  var email, password, loadedUser, user, error, isEqual, _error, token;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          email = req.body.email;
          password = req.body.password;
          _context2.prev = 2;
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 5:
          user = _context2.sent;

          if (user) {
            _context2.next = 10;
            break;
          }

          error = new Error("a user with this email could not be found");
          error.statusCode = 404;
          throw error;

        case 10:
          loadedUser = user;
          _context2.next = 13;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 13:
          isEqual = _context2.sent;

          if (isEqual) {
            _context2.next = 18;
            break;
          }

          _error = new Error("wrong password!");
          _error.statusCode = 401;
          throw _error;

        case 18:
          token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
          }, "secret", {
            expiresIn: "1h"
          });
          res.status(200).json({
            token: token,
            userId: loadedUser._id.toString()
          });
          _context2.next = 26;
          break;

        case 22:
          _context2.prev = 22;
          _context2.t0 = _context2["catch"](2);

          if (!_context2.t0.statusCode) {
            _context2.t0.statusCode = 500;
          }

          next(_context2.t0);

        case 26:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[2, 22]]);
};

exports.getUserStatus = function _callee3(req, res, next) {
  var user, error;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(User.findById(req.userId));

        case 3:
          user = _context3.sent;

          if (user) {
            _context3.next = 8;
            break;
          }

          error = new Error("user not found!");
          error.statusCode = 404;
          throw error;

        case 8:
          res.status(200).json({
            status: user.status
          });
          _context3.next = 15;
          break;

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](0);

          if (!_context3.t0.statusCode) {
            _context3.t0.statusCode = 500;
          }

          next(_context3.t0);

        case 15:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

exports.updateUserStatus = function _callee4(req, res, next) {
  var newUserStatus, user, error;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          newUserStatus = req.body.status;
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(User.findById(req.userId));

        case 4:
          user = _context4.sent;

          if (user) {
            _context4.next = 9;
            break;
          }

          error = new Error("cannot find user!");
          error.statusCode = 404;
          throw error;

        case 9:
          user.status = newUserStatus;
          _context4.next = 12;
          return regeneratorRuntime.awrap(user.save());

        case 12:
          res.status(200).json({
            message: "user status updated"
          });
          _context4.next = 19;
          break;

        case 15:
          _context4.prev = 15;
          _context4.t0 = _context4["catch"](1);

          if (!_context4.t0.statusCode) {
            _context4.t0.statusCode = 500;
          }

          next(_context4.t0);

        case 19:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 15]]);
};