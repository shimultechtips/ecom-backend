const {
  createDiscount,
  getDiscount,
} = require("../controllers/discountController");
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");

const router = require("express").Router();

router
  .route("/")
  .post([authorize, admin], createDiscount)
  .get(authorize, getDiscount);

module.exports = router;
