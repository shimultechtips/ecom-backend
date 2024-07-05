const { Review } = require("../models/review");

module.exports.createReview = async (req, res) => {
  const review = new Review(req.body);

  try {
    const result = await review.save();
    return res.status(201).send({
      message: "Review Created Successfully!",
      data: review,
    });
  } catch (error) {
    res.status(500).send(`Internal Server error!: ${JSON.stringify(error)}`);
  }
};

module.exports.getReviews = async (req, res) => {
  const productId = req.params.id;
  const reviews = await Review.find({ product: productId }).sort({
    updatedAt: -1,
  });

  if (!reviews) return res.status(404).send("Not Found!");

  return res.status(200).send(reviews);
};
