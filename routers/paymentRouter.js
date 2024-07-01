const router = require("express").Router();
const {
  initPayment,
  ipn,
  // paymentSuccess,
  // paymentCancel,
  // paymentFail,
} = require("../controllers/paymentControllers");
const authorize = require("../middlewares/authorize");

router.route("/").get(authorize, initPayment);
router.route("/ipn").post(ipn);
// router.route("/success").post(paymentSuccess);
// router.route("/fail").post(paymentFail);
// router.route("/cancel").post(paymentCancel);

module.exports = router;
