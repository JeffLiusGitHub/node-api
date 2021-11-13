"use strict";

var _require = require("express-validator"),
    validationResult = _require.validationResult;

var fs = require("fs");

var path = require("path");

var Post = require("../models/post");

var User = require("../models/user");

exports.getPosts = function (req, res, next) {
  var currentPage = req.query.page || 1;
  var perPage = 2;
  var totalItems;
  Post.find().countDocuments().then(function (count) {
    totalItems = count;
    return Post.find().skip((currentPage - 1) * perPage).limit(perPage);
  }).then(function (posts) {
    res.status(200).json({
      message: "Fetched posts successfully.",
      posts: posts,
      totalItems: totalItems
    });
  })["catch"](function (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  });
};

exports.postPost = function _callee(req, res, next) {
  var errors, error, _error, imageUrl, title, content, creator, post, user;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          errors = validationResult(req);

          if (errors.isEmpty()) {
            _context.next = 5;
            break;
          }

          error = new Error("validation failed, entered data is incorrect.");
          error.statusCode = 422;
          throw error;

        case 5:
          if (req.file) {
            _context.next = 9;
            break;
          }

          _error = new Error("No image provided,");
          _error.statusCode = 422;
          throw _error;

        case 9:
          imageUrl = req.file.path;
          title = req.body.title;
          content = req.body.content;
          post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: req.userId
          });
          _context.prev = 13;
          _context.next = 16;
          return regeneratorRuntime.awrap(post.save());

        case 16:
          _context.next = 18;
          return regeneratorRuntime.awrap(User.findById(req.userId));

        case 18:
          user = _context.sent;
          console.log("user" + user.name);
          creator = user.name;
          user.posts.push(post);
          _context.next = 24;
          return regeneratorRuntime.awrap(user.save());

        case 24:
          res.status(201).json({
            message: "Post created successfully!",
            post: post,
            creator: {
              _id: creator._id,
              name: creator.name
            }
          });
          _context.next = 31;
          break;

        case 27:
          _context.prev = 27;
          _context.t0 = _context["catch"](13);

          if (!_context.t0.statusCode) {
            _context.t0.statusCode = 500;
          }

          next(_context.t0);

        case 31:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[13, 27]]);
};

exports.getPost = function _callee2(req, res, next) {
  var postId, post, error;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          postId = req.params.postId;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(Post.findById(postId));

        case 4:
          post = _context2.sent;

          if (post) {
            _context2.next = 9;
            break;
          }

          error = new Error("could not find post");
          error.statusCode = 404;
          throw error;

        case 9:
          res.status(200).json({
            message: "Post fetched.",
            post: post
          });
          _context2.next = 15;
          break;

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](1);

          if (!_context2.t0.statusCode) {
            _context2.t0.statusCode = 500;
            next(_context2.t0);
          }

        case 15:
          ;

        case 16:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 12]]);
};

exports.updatePost = function (req, res, next) {
  var postId = req.params.postId;
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    var error = new Error("validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  var title = req.body.title;
  var content = req.body.content;
  var imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    var _error2 = new Error("no image found!");

    _error2.statusCode = 422;
    throw _error2;
  }

  Post.findById(postId).then(function (post) {
    if (!post) {
      var _error3 = new Error("could not find the post");

      _error3.statusCode = 404;
      throw _error3;
    }

    if (post.creator.toString() !== req.userId) {
      var _error4 = new Error("Not authorized!");

      _error4.statusCode = 403;
      throw _error4;
    }

    console.log(post.imageUrl);

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    return post.save();
  }).then(function (result) {
    res.status(200).json({
      message: "Post updated!",
      post: result
    });
  })["catch"](function (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  });
};

exports.deletePost = function (req, res, next) {
  var postId = req.params.postId;
  Post.findById(postId).then(function (post) {
    if (!post) {
      var error = new Error("could not find the post");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId) {
      var _error5 = new Error("Not authorized!");

      _error5.statusCode = 403;
      throw _error5;
    } //check logged in user


    clearImage(post.imageUrl);
    return Post.findByIdAndRemove(postId);
  }).then(function (result) {
    return User.findById(req.userId);
  }).then(function (user) {
    user.posts.pull(postId);
    return user.save();
  }).then(function (result) {
    // console.log(result);
    res.status(200).json({
      message: "Deleted post!"
    });
  })["catch"](function (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  });
};

var clearImage = function clearImage(filePath) {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, function (err) {
    return console.log(err);
  }); //delete file
};