"use strict";

var path = require("path");

var express = require("express");

var bodyParser = require("body-parser");

var mongoose = require("mongoose");

var multer = require("multer");

var feedRoutes = require("./routes/feed");

var authRoutes = require("./routes/auth");

var app = express();
var fileStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, "images");
  },
  filename: function filename(req, file, cb) {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
});

var fileFilter = function fileFilter(req, file, cb) {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
}; // app.use(bodyParser.urlencoded());// parse application/x-www-form-urlencoded


app.use(bodyParser.json()); //app/json

app.use(multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single("image"));
app.use("/images", express["static"](path.join(__dirname, "images")));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});
app.use("/feed", feedRoutes);
app.use('/auth', authRoutes);
app.use(function (error, req, res, next) {
  console.log(error);
  var status = error.statusCode || 500;
  var message = error.message;
  var data = error.data;
  res.status(status).json({
    message: message,
    data: data
  });
});
mongoose.connect("mongodb+srv://jeffliu:911006@cluster0.gbw3n.mongodb.net/messages?retryWrites=true&w=majority").then(function (result) {
  app.listen(8080);
})["catch"](function (err) {
  return console.log(err);
});