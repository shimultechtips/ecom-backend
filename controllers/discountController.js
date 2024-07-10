const { Discount } = require("../models/discount");

module.exports.getDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOne({ name: req.query.name }).select({
      percentage: 1,
    });
    if (discount === null) {
      res.status(404).send({
        message: "Invalid Discount Coupon!",
      });
    } else {
      res.status(200).send(discount);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports.getDiscountAll = async (req, res) => {
  const discounts = await Discount.find();

  res.status(200).send(discounts);
};

module.exports.deleteDiscount = async (req, res) => {
  const discounts = await Discount.deleteOne({ _id: req.params.id });

  res.status(200).send(discounts);
};

module.exports.createDiscount = async (req, res) => {
  const discount = new Discount(req.body);

  try {
    await discount.save();
    res.status(201).send("Discount Created!");
  } catch (err) {
    res.status(500).send(`Duplicate Code Or Internal Error!, ${err.message}`);
  }
};
