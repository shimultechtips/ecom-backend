require("dotenv/config");
const app = require("./app");
const mongoose = require("mongoose");

global.__basedir = __dirname;

const DB = process.env.MONGODB_SERVER.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("Connected To MongoDB!"))
  .catch((err) => console.log("MongoDB Connection Failed!"));

const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`Listening On Port ${port}`));

module.exports = app;
