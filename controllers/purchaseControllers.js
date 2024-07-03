const { Order } = require("../models/order");

module.exports.getPurchaseHistory = async (req, res) => {
  const purchaseHistory = await Order.find({
    user: req.user._id,
  })
    .populate("product", "name price")
    .populate("user", "name");

  return res.status(200).send(purchaseHistory);
};
