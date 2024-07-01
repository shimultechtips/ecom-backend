require("express-async-errors");

const express = require("express");
const cors = require("cors");
const app = express();
const error = require("./middlewares/error");

require("./middlewares")(app);
require("./middlewares/routes")(app);

app.use(cors());
app.use(error);

module.exports = app;
