const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");
const { Product, validate } = require("../models/product");

module.exports.createProduct = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).send("Something Went Wrong!");
    const { error } = validate(
      _.pick(fields, ["name", "description", "price", "category", "quantity"])
    );
    if (error) return res.status(400).send(error.details[0].message);

    const product = new Product(fields);

    if (files.photo) {
      fs.readFile(files.photo.path, (err, data) => {
        if (err) return res.status(400).send("Problem In File Data!");
        product.photo.data = data;
        product.photo.contentType = files.photo.type;
        product.save((err, result) => {
          if (err) return res.status(500).send("Internal Server Error!");
          else
            return res.status(201).send({
              message: "Product Created Successfully!",
              data: _.pick(result, [
                "name",
                "description",
                "price",
                "category",
                "quantity",
              ]),
            });
        });
      });
    } else {
      return res.status(400).send("No Image Provided!");
    }
  });
};

module.exports.getProducts = async (req, res) => {};
module.exports.getProductById = async (req, res) => {};
module.exports.updateProductById = async (req, res) => {};
