"use strict";

var jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  var authHeader = req.get("Authorization");

  if (!authHeader) {
    var error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }

  var token = authHeader.split(" ")[1];
  var decodedToken;

  try {
    decodedToken = jwt.verify(token, "secret");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    var _error = new Error("not Authenticated");

    _error.statusCode = 401;
    throw _error;
  }

  req.userId = decodedToken.userId;
  next();
};