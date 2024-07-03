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
  // api/product?ordr=desc&sortBy=name&limit=10
  // console.log(req.query);
  let order = req.query.order === "descending" ? -1 : 1;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const products = await Product.find()
    .select({ photo: 0 })
    .sort({ [sortBy]: order })
    .limit(limit)
    .populate("category", "name");
  // .populate("category", "name createdAt");
  return res.status(200).send(products);
};

module.exports.getProductById = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId)
    .select({ photo: 0 })
    .populate("category", "name");

  if (!product) return res.status(404).send("Not Found!");

  return res.status(200).send(product);
};

module.exports.getPhoto = async (req, res) => {
  const productId = req.params.id;
  //.select('photo, -_id')
  const product = await Product.findById(productId).select({
    photo: 1,
    _id: 0,
  });
  res.set("Content-Type", product.photo.contentType);
  return res.status(200).send(product.photo.data);
};

module.exports.updateProductById = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).send("Something Wrong!");

    for (key in fields) {
      fields[key] = fields[key][0];
    }

    const updatedFields = _.pick(fields, [
      "name",
      "description",
      "price",
      "category",
      "quantity",
    ]);
    _.assignIn(product, updatedFields);

    if (files.photo) {
      fs.readFile(files.photo[0].filepath, async (err, data) => {
        if (err) return res.status(400).send("Something Wrong!");
        product.photo.data = data;
        product.photo.contentType = files.photo.type;

        try {
          await product.save();
          return res.status(201).send({
            message: "Product Updated Successfully!",
          });
        } catch (error) {
          res
            .status(500)
            .send(`Internal Server error!: ${JSON.stringify(error)}`);
        }
      });
    } else {
      try {
        await product.save();
        return res.status(201).send({
          message: "Product Updated Successfully!",
        });
      } catch (error) {
        res
          .status(500)
          .send(`Internal Server error!: ${JSON.stringify(error)}`);
      }
    }
  });
};

// Filter Products
// const body = {
//   order: "desc",
//   sortBy: "price",
//   limit: 6,
//   skip: 10,
//   filters: {
//     price: [300, 1000],
//     category: ["sd;lfjasdiofj0", "sdfguashguh", "asdlkuhsdui"],
//   },
// };

module.exports.filterProducts = async (req, res) => {
  let order = req.body.order === "descending" ? -1 : 1;
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = parseInt(req.body.skip);
  let filters = req.body.filters;

  let args = {};

  for (let key in filters) {
    if (filters[key].length > 0) {
      if (key === "price") {
        // { price : {$gte : 0, &lte : 1000}}
        args["price"] = {
          $gte: filters["price"][0],
          $lte: filters["price"][1],
        };
      }

      if (key === "category") {
        // category : {$in : ['', '']}
        args["category"] = {
          $in: filters["category"],
        };
      }
    }
  }

  // console.log(args);

  const products = await Product.find(args)
    .select({ photo: 0 })
    .populate("category", "name")
    .sort({ [sortBy]: order })
    .skip(skip)
    .limit(limit);

  return res.status(200).send(products);
};
