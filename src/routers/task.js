"use strict";

const express = require("express");
const router = new express.Router();
const taskController = require("../controllers/task");
const authentication = require("../middleware/authentication");

router.post("/", authentication, taskController.createTask);
router.get("/", authentication, taskController.getAllTasks);
router.get("/:id", authentication, taskController.getTask);
router.patch("/:id", authentication, taskController.updateTask);
router.delete("/:id", authentication, taskController.deleteTask);

module.exports = router;
