const router = require("express").Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  getPhoto,
  filterProducts,
  updateTotalRating,
  updateSoldAndQuantity,
  getProductsBySearch,
} = require("../controllers/productController");
const admin = require("../middlewares/admin");
const authorize = require("../middlewares/authorize");

router.route("/").post([authorize, admin], createProduct).get(getProducts);

router
  .route("/:id")
  .get(getProductById)
  .put([authorize, admin], updateProductById);

router.route("/photo/:id").get(getPhoto);

router.route("/filter").post(filterProducts);
router.route("/:id/updatetotalrating").post(authorize, updateTotalRating);
router
  .route("/:id/updatesoldandquantity")
  .post(authorize, updateSoldAndQuantity);

router.route("/search").post(getProductsBySearch);

module.exports = router;
