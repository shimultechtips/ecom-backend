const router = require("express").Router();
const {
  createReview,
  getReviews,
} = require("../controllers/reviewControllers");
const authorize = require("../middlewares/authorize");

router.route("/").post(authorize, createReview);
router.route("/:id").get(getReviews);

module.exports = router;
