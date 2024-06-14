const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");
const { Product, validate } = require("../models/product");

module.exports.createProduct = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).send("Something Went Wrong!");

    for (key in fields) {
      fields[key] = fields[key][0];
    }

    const { error } = validate(
      _.pick(fields, ["name", "description", "price", "category", "quantity"])
    );
    if (error) return res.status(400).send(error.details[0].message);

    const product = new Product(fields);

    if (files.photo) {
      fs.readFile(files.photo[0].filepath, async (err, data) => {
        if (err) return res.status(400).send("Problem in file data!");
        product.photo.data = data;
        product.photo.contentType = files.photo.type;
        try {
          const result = await product.save();
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
        } catch (error) {
          res
            .status(500)
            .send(`Internal Server error!: ${JSON.stringify(error)}`);
        }
      });
    } else {
      return res.status(400).send("No Image Provided!");
    }
  });
};

module.exports.getProducts = async (req, res) => {
  const products = await Product.find().select({ photo: 0 });
  return res.status(200).send(products);
};
module.exports.getProductById = async (req, res) => {};
module.exports.updateProductById = async (req, res) => {};
