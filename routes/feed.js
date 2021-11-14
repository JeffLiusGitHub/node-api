// const express = require("express");
// const { body } = require("express-validator");

// const feedController = require("../controllers/feed");
// const isAuth = require("../middleware/is-auth");


import express from "express";
import {body} from "express-validator";
import {getPost,getPosts,postPost,updatePost,deletePost} from "../controllers/feed.js";
import isAuth from "../middleware/is-auth.js";
 
const router = express.Router();
//GET /feed/posts
router.get("/posts", isAuth,getPosts);
//POST /feed/posts
router.post(
  "/post",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
   postPost
);

router.get("/post/:postId",  getPost);

router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
   updatePost
);

router.delete("/post/:postId", isAuth,  deletePost);

export default router;
