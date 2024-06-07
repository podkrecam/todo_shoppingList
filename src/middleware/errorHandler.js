"use strict";

const errorHandler = async (error, req, res, next) => {
  res.status(400).send(error.message);
};

module.exports = errorHandler;
