const { Order } = require("../models/order");

module.exports.getOrderHistory = async (req, res) => {
  const orderHistory = await Order.find({
    user: req.user._id,
    status: "Pending",
  }).sort({ createdAt: -1 });

  return res.status(200).send(orderHistory);
};

module.exports.deleteOrderHistory = async (req, res) => {
  const order = await Order.deleteOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (order.acknowledged) {
    return res.status(200).send("Order Deleted!");
  } else {
    return res.status(500).send("Internal Error!!");
  }
};
