const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const { getDiscountAll } = require("../controllers/discountController");

const router = require("express").Router();

router.route("/").get([authorize, admin], getDiscountAll);

module.exports = router;
