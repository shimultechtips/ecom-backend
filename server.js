require("dotenv/config");
const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(process.env.MONGODB_URL_LOCAL)
  .then(() => console.log("Connected To MongoDB!"))
  .catch((err) => console.error("Connection Error!"));

const port = process.env.PORT || 3001;

app.listen(port, () => console.log("Listening On Port : ", port));
