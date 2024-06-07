"use strict";

const Task = require("../models/task");

// create task
const createTask = async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(403).send(error.message);
  }
};

// get all tasks
const getAllTasks = async (req, res) => {
  const match = {};
  const sort = {};
  const category = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.category) {
    match.category = req.query.category;
  }

  if (req.query.sortBy) {
    const [sortBy, value] = req.query.sortBy.split(":");
    sort[sortBy] = value === "desc" ? -1 : 1;
  }

  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit) || null,
        skip: parseInt(req.query.skip) || null,
        sort,
      },
    });
    const tasks = req.user.tasks;
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// get task by id
const getTask = async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// update task by id
const updateTask = async (req, res) => {
  const _id = req.params.id;
  const newValues = req.body;

  const updates = Object.keys(newValues);
  const allowedUpdates = Object.keys(Task.schema.tree).slice(0, -3);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = newValues[update]));
    await task.save();

    res.send(task);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// delete task by id
const deleteTask = async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
};

module.exports = {
  createTask,
  getTask,
  getAllTasks,
  updateTask,
  deleteTask,
};
