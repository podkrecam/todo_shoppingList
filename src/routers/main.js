"use strict";

const express = require("express");
const router = new express.Router();
const authentication = require("../middleware/authentication");

router.get("/", (req, res) => {
  res.render("index");
});
router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});
router.get("/login-required", (req, res) => {
  res.render("login-required");
});
router.get("/myaccount", authentication, (req, res) => {
  res.render("myaccount");
});

router.get("*", (req, res) => {
  res.render("404");
});

module.exports = router;
