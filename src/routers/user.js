"use strict";

const express = require("express");
const router = new express.Router();
const userController = require("../controllers/user");
const authentication = require("../middleware/authentication");
const { upload, uploadImageProfile } = require("../middleware/upload");
const errorHandler = require("../middleware/errorHandler");

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/logout", authentication, userController.logoutUser);
router.post("/logoutAll", authentication, userController.logoutAll);
router.post(
  "/me/avatar",
  [authentication, uploadImageProfile, errorHandler],
  userController.uploadProfileImage
);
router.delete(
  "/me/avatar",
  [authentication, errorHandler],
  userController.deleteProfileImage
);
router.get("/:id/avatar", userController.getProfileImage);
router.get("/me", authentication, userController.getProfile);
router.patch("/me", authentication, userController.updateUser);
router.delete("/me", authentication, userController.deleteUser);

module.exports = router;
