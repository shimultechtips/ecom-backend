const { Schema, model } = require("mongoose");

module.exports.Review = model(
  "Review",
  Schema(
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: String,
      comment: String,
      rating: Number,
    },
    { timestamps: true }
  )
);
