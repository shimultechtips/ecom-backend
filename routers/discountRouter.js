const {
  createDiscount,
  getDiscount,
  deleteDiscount,
} = require("../controllers/discountController");
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");

const router = require("express").Router();

router
  .route("/")
  .post([authorize, admin], createDiscount)
  .get(authorize, getDiscount);

router.route("/:id").delete([authorize, admin], deleteDiscount);

module.exports = router;
