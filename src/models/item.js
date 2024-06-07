"use strict";

"use strict";

const validator = require("validator");
const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Item = new mongoose.model("Item", itemSchema);

module.exports = Item;
