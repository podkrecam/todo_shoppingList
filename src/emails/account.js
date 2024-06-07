"use strict";

const nodemailer = require("nodemailer");

const config = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
};
const transporter = nodemailer.createTransport(config);

const sendWelcomeEmail = async (email, name) => {
  config;
  transporter;
  const message = {
    subject: `Welcome, ${name}!`,
    from: "ToDo App " + "<" + process.env.EMAIL + ">",
    to: email,
    text: `Hello ${name}, Thanks for signing up!`,
    html: `<h1>Hello ${name}, Thanks for signing up!</h1>`,
  };
  await transporter.sendMail(message);
};

const sendGoodbyeEmail = async (email, name) => {
  config;
  transporter;
  const message = {
    subject: `Sorry to see you go, ${name}`,
    from: process.env.EMAIL,
    to: email,
    text: `Goodbye ${name}, I hope to see you back sometime soon.`,
    html: `<h1>Goodbye ${name}, I hope to see you back sometime soon.</h1>`,
  };
  await transporter.sendMail(message);
};

module.exports = { sendWelcomeEmail, sendGoodbyeEmail };
