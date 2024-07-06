const {
  createDiscountPercentage,
  deleteDiscountPercentage,
} = require("../controllers/discountPercentageController");
const authorize = require("../middlewares/authorize");

const router = require("express").Router();

router.route("/").post(authorize, createDiscountPercentage);
router.route("/").delete(authorize, deleteDiscountPercentage);

module.exports = router;
