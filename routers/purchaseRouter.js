const router = require("express").Router();
const {
  getPurchaseHistory,
  getTransactionHistory,
} = require("../controllers/purchaseControllers");
const authorize = require("../middlewares/authorize");

router.route("/").get(authorize, getPurchaseHistory);
router.route("/transaction").post(authorize, getTransactionHistory);

module.exports = router;
