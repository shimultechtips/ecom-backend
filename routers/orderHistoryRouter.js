const router = require("express").Router();

const {
  getOrderHistory,
  deleteOrderHistory,
} = require("../controllers/orderHistoryController");
const authorize = require("../middlewares/authorize");

router.route("/").get(authorize, getOrderHistory);
router.route("/:id").delete(authorize, deleteOrderHistory);

module.exports = router;
