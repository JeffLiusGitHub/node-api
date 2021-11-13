"use strict";

var express = require("express");

var _require = require("express-validator"),
    body = _require.body;

var feedController = require("../controllers/feed");

var isAuth = require("../middleware/is-auth");

var router = express.Router(); //GET /feed/posts

router.get("/posts", isAuth, feedController.getPosts); //POST /feed/posts

router.post("/post", isAuth, [body("title").trim().isLength({
  min: 5
}), body("content").trim().isLength({
  min: 5
})], feedController.postPost);
router.get("/post/:postId", feedController.getPost);
router.put("/post/:postId", isAuth, [body("title").trim().isLength({
  min: 5
}), body("content").trim().isLength({
  min: 5
})], feedController.updatePost);
router["delete"]("/post/:postId", isAuth, feedController.deletePost);
module.exports = router;