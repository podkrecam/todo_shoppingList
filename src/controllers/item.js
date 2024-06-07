"use strict";

const Item = require("../models/item");

// create item
const createItem = async (req, res) => {
  console.log(req);
  const item = new Item({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await item.save();
    res.status(201).send(item);
  } catch (error) {
    res.status(403).send(error.message);
  }
};

// get all items
const getAllItems = async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.sortBy) {
    const [sortBy, value] = req.query.sortBy.split(":");
    sort[sortBy] = value === "desc" ? -1 : 1;
  }

  try {
    await req.user.populate({
      path: "items",
      match,
      options: {
        limit: parseInt(req.query.limit) || null,
        skip: parseInt(req.query.skip) || null,
        sort,
      },
    });
    const items = req.user.items;
    res.send(items);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// get item by id
const getItem = async (req, res) => {
  const _id = req.params.id;

  try {
    const item = await Item.findOne({ _id, owner: req.user._id });

    if (!item) {
      return res.status(404).send();
    }

    res.send(item);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// update item by id
const updateItem = async (req, res) => {
  const _id = req.params.id;
  const newValues = req.body;

  const updates = Object.keys(newValues);
  const allowedUpdates = Object.keys(Item.schema.tree).slice(0, -3);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const item = await Item.findOne({ _id, owner: req.user._id });

    if (!item) {
      return res.status(404).send();
    }

    updates.forEach((update) => (item[update] = newValues[update]));
    await item.save();

    res.send(item);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// delete item by id
const deleteItem = async (req, res) => {
  const _id = req.params.id;

  try {
    const item = await Item.findOneAndDelete({ _id, owner: req.user._id });

    if (!item) {
      return res.status(404).send();
    }

    res.send(item);
  } catch (error) {
    res.status(500).send();
  }
};

module.exports = {
  createItem,
  getItem,
  getAllItems,
  updateItem,
  deleteItem,
};
