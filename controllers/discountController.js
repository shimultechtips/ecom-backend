const { Discount } = require("../models/discount");

module.exports.getDiscount = async (req, res) => {
  const discounts = new Discount.find();

  res.status(200).send(discounts);
};

module.exports.createDiscount = async (req, res) => {
  const discount = new Discount(req.body);

  try {
    await discount.save();
    res.status(200).send("Discount Created!");
  } catch (err) {
    res.status(500).send(`Internal Server error!: ${JSON.stringify(err)}`);
  }
};
