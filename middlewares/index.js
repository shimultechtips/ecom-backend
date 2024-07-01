const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

module.exports = (app) => {
  app.use(express.json());
  app.use(cors());
  // app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }
};
