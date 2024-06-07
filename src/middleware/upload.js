"use strict";

const multer = require("multer");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, __dirname + "../../../uploads");
  },
  filename(req, file, cb) {
    const uniqueSuffix = "-" + Date.now() + "-" + req.user._id;
    cb(null, file.fieldname + uniqueSuffix);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
      return cb(new Error("Please upload a PDF, DOC or DOCX file"));
    }

    cb(undefined, true);
  },
});

const uploadImageProfile = multer({
  limits: {
    fileSize: 1024 * 1024 * 1, // 1MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a JPG, JPEG or PNG file"));
    }

    cb(undefined, true);
  },
}).single("avatar");

module.exports = { upload, uploadImageProfile };
