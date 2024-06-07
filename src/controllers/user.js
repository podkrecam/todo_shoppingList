"use strict";

const User = require("../models/user");
const sharp = require("sharp");
const { sendWelcomeEmail, sendGoodbyeEmail } = require("../emails/account");

// create user
const createUser = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    // sendWelcomeEmail(user.email, user.name.slice(0, user.name.indexOf(" ")));
    const token = await user.generateAuthToken();
    res.cookie("token", token, { httpOnly: true });
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.cookie("token", token, { httpOnly: true });
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// logout current authenticated user from the current session
const logoutUser = async (req, res) => {
  try {
    // check if the sent token is in user tokens array and return the new array without sent token
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    // save changed user
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
};

// logout user from all sessions
const logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
};

// get authenticated user
const getProfile = async (req, res) => {
  res.send(req.user);
};

// update user by id
const updateUser = async (req, res) => {
  const newValues = req.body; // get new values from the request JSON

  // check if the sent values are exists in the allowed properties
  const updates = Object.keys(newValues);
  const allowedUpdates = Object.keys(User.schema.tree).slice(0, -3);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = newValues[update]));
    await req.user.save();

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// delete user by id
const deleteUser = async (req, res) => {
  try {
    await req.user.deleteOne();
    // sendGoodbyeEmail(
    //   req.user.email,
    //   req.user.name.slice(0, req.user.name.indexOf(" "))
    // );
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// upload user profile image
const uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: "No file to upload" });
  }

  const buffer = await sharp(req.file.buffer)
    .resize({ width: 150, height: 150 })
    .png()
    .toBuffer();

  req.user.avatar = buffer;
  await req.user.save();
  res.send();
};

const deleteProfileImage = async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
};

const getProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
};

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  logoutAll,
  getProfile,
  updateUser,
  deleteUser,
  uploadProfileImage,
  deleteProfileImage,
  getProfileImage,
};
