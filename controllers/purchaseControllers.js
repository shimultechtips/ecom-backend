const { Order } = require("../models/order");
const { Payment } = require("../models/payment");

module.exports.getPurchaseHistory = async (req, res) => {
  const purchaseHistory = await Order.find({
    user: req.user._id,
    status: "Complete",
  }).sort({ createdAt: -1 });

  return res.status(200).send(purchaseHistory);
};

module.exports.getTransactionHistory = async (req, res) => {
  const transactionHistory = await Payment.find({
    tran_id: req.body.tran_id,
  }).select({ amount: 1, tran_id: 1, tran_date: 1, status: 1 });

  return res.status(200).send(transactionHistory);
};
