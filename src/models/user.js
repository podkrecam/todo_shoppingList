"use strict";

const validator = require("validator");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");
const Item = require("./item");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Your password cannot contain "password" word');
        }
        if (!validator.isStrongPassword(value, { minLength: 6 })) {
          throw new Error(
            "Your password is too weak. Please choose a stronger password with at least 6 characters, including uppercase and lowercase letters, numbers, and special characters."
          );
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
        if (value > 100) {
          throw new Error("Are you really that old?");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
      default: "asd",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.virtual("items", {
  ref: "Item",
  localField: "_id",
  foreignField: "owner",
});

// authorizate the user by email and password
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("Wrong email or password");
  }
  // compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Wrong email or password");
  }

  return user;
};

// generate authorization token and save token to the database
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "1 hour",
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// hide properties
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// hash the password
userSchema.pre("save", async function (next) {
  const user = this;
  // check if the password was sent by the user
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// delete tasks and items when user is removed
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });
    await Item.deleteMany({ owner: user._id });

    next();
  }
);

const User = new mongoose.model("User", userSchema);

module.exports = User;
