const { Schema, model } = require("mongoose");

module.exports.Discount = model(
  "Discount",
  Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
      },
      percentage: {
        type: Number,
        required: true,
        unique: true,
      },
    },
    { timestamps: true }
  )
);
