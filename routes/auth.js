// const express = require("express");
// const { body } = require("express-validator");
// const User = require("../models/user");
// const authController = require("../controllers/auth");
// const isAuth = require('../middleware/is-auth')


import express from "express";
import {body} from "express-validator";
import User from "../models/user.js";
import {signup,login,getUserStatus,updateUserStatus} from "../controllers/auth.js";
import isAuth from "../middleware/is-auth.js"
const router = express.Router();


router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
   signup
);

router.get('/status',isAuth, getUserStatus)

router.post('/login', login)

router.patch('/status',isAuth,[body('status').trim().not().isEmpty()], updateUserStatus);

export default router;
