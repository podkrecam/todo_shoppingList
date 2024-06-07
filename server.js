"use strict";
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const ejs = require("ejs");
const mongoose = require("./src/db/mongoose");

const app = express();
const port = process.env.PORT;

const userRouter = require("./src/routers/user");
const taskRouter = require("./src/routers/task");
const itemRouter = require("./src/routers/item");
const mainRouter = require("./src/routers/main");

const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "views");

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/users", userRouter);
app.use("/tasks", taskRouter);
app.use("/items", itemRouter);
app.use(mainRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
