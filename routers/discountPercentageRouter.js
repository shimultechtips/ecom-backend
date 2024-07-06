const {
  createDiscountPercentage,
} = require("../controllers/discountPercentageController");
const authorize = require("../middlewares/authorize");

const router = require("express").Router();

router.route("/").post(authorize, createDiscountPercentage);

module.exports = router;
