"use strict";

const express = require("express");
const router = new express.Router();
const itemController = require("../controllers/item");
const authentication = require("../middleware/authentication");

router.post("/", authentication, itemController.createItem);
router.get("/", authentication, itemController.getAllItems);
router.get("/:id", authentication, itemController.getItem);
router.patch("/:id", authentication, itemController.updateItem);
router.delete("/:id", authentication, itemController.deleteItem);

module.exports = router;
