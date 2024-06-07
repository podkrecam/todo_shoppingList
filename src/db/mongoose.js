"use strict";

const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to the database!");
  } catch (error) {
    console.error(error);
  }
}

connect();
