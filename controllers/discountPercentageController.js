const { DiscountPercentage } = require("../models/discountPercentage");

module.exports.createDiscountPercentage = async (req, res) => {
  const userId = req.user._id;

  let discountPercentage = {};
  discountPercentage = await DiscountPercentage.findOne({ user: userId });

  if (discountPercentage) {
    discountPercentage.percentage = req.body.percentage;
  } else {
    discountPercentage = new DiscountPercentage({
      user: userId,
      percentage: req.body.percentage,
    });
  }

  try {
    await discountPercentage.save();
    res.status(201).send("Discount Percentage Created Or Updated!");
  } catch (err) {
    res.status(500).send(`Duplicate Code Or Internal Error!, ${err.message}`);
  }
};
