const router = require("express").Router();
const { getPurchaseHistory } = require("../controllers/purchaseControllers");
const authorize = require("../middlewares/authorize");

router.route("/").get(authorize, getPurchaseHistory);

module.exports = router;
