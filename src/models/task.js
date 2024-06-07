"use strict";

const validator = require("validator");
const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    category: {
      type: String,
      enum: ["Work", "Personal", "School", "Other"],
      default: "Other",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = new mongoose.model("Task", taskSchema);

module.exports = Task;
