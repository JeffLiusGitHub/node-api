"use strict";

var _require = require("express-validator/check"),
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

exports.postPost = function (req, res, next) {
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    var error = new Error("validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    var _error = new Error("No image provided,");

    _error.statusCode = 422;
    throw _error;
  }

  var imageUrl = req.file.path;
  var title = req.body.title;
  var content = req.body.content;
  var creator;
  var post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  });
  post.save().then(function (result) {
    console.log(result);
    return User.findById(req.userId);
  }).then(function (user) {
    console.log("user" + user.name);
    creator = user.name;
    user.posts.push(post);
    return user.save();
  }).then(function (result) {
    console.log(result);
    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: {
        _id: creator._id,
        name: creator.name
      }
    });
  })["catch"](function (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  });
};

exports.getPost = function (req, res, next) {
  var postId = req.params.postId;
  Post.findById(postId).then(function (post) {
    if (!post) {
      var error = new Error("could not find post");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Post fetched.",
      post: post
    });
  })["catch"](function (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  });
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