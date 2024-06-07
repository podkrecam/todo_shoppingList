"use strict";
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// authenticate user function
const authentication = async (req, res, next) => {
  try {
    // get token from the user's request Authorization header
    // use if you want to store token in local storage - warning!!! - XSS attack possible
    // const token = req.header("Authorization").replace("Bearer ", "");
    const token = req.cookies.token;

    if (!token) {
      if (req.headers.accept.includes("application/json")) {
        return res.status(401).json({ error: "Please authenticate." });
      } else {
        return res.redirect("/login-required");
      }
    }

    // decode sent token using jwt.verify()
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // find the user by decoded id and check token in the tokens array
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      if (req.headers.accept.includes("application/json")) {
        return res.status(401).json({ error: "Please authenticate." });
      } else {
        return res.redirect("/login-required");
      }
    }

    // set the token and user to request
    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    if (req.headers.accept.includes("application/json")) {
      return res.status(401).json({ error: "Invalid Authentication" });
    } else {
      return res.redirect("/login-required");
    }
  }
};

module.exports = authentication;
