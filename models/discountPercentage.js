const { Schema, model } = require("mongoose");

module.exports.DiscountPercentage = model(
  "DiscountPercentage",
  Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
        unique: true,
      },
      percentage: Number,
    },
    { timestamps: true }
  )
);
