const { CartItem } = require("../models/cartItem");
const PaymentSession = require("ssl-commerz-node").PaymentSession;
const { Profile } = require("../models/profile");
const { Order } = require("../models/order");
const { Payment } = require("../models/payment");
const path = require("node:path");

module.exports.ipn = async (req, res) => {
  const payment = new Payment(req.body);
  const tran_id = payment["tran_id"];
  if (payment["status"] === "VALID") {
    const order = await Order.updateOne(
      { transaction_id: tran_id },
      { status: "Complete" }
    );
    await CartItem.deleteMany(order.cartItems);
  } else {
    await Order.deleteOne({ transaction_id: tran_id });
  }
  await payment.save();
  return res.status(200).send("IPN");
};

module.exports.initPayment = async (req, res) => {
  const userId = req.user._id;
  const cartItems = await CartItem.find({ user: userId });
  const profile = await Profile.findOne({ user: userId });

  const { address1, address2, city, state, postcode, country, phone } = profile;

  const total_amount = cartItems
    .map((item) => item.count * item.price)
    .reduce((a, b) => a + b, 0);

  let discountPrice;

  if (req.query.discount !== "undefined") {
    discountPrice = req.query.discount;
  } else {
    discountPrice = total_amount;
  }

  const total_item = cartItems
    .map((item) => item.count)
    .reduce((a, b) => a + b, 0);

  const tran_id =
    "_" + Math.random().toString(36).substring(2, 9) + new Date().getTime();

  const payment = new PaymentSession(
    true,
    process.env.STORE_ID,
    process.env.STORE_PASSWORD
  );

  // Set the urls
  payment.setUrls({
    success: "https://ecom-backend-topaz.vercel.app/api/payment/success", // If payment Succeed
    fail: "https://ecom-backend-topaz.vercel.app/api/payment/fail", // If payment failed
    cancel: "https://ecom-backend-topaz.vercel.app/api/payment/cancel", // If user cancel payment
    ipn: "https://ecom-backend-topaz.vercel.app/api/payment/ipn", // SSLCommerz will send http post request in this link
  });

  // Set order details
  payment.setOrderInfo({
    total_amount: discountPrice, // Number field
    currency: "BDT", // Must be three character string
    tran_id: tran_id, // Unique Transaction id
    emi_option: 0, // 1 or 0

    // multi_card_name: "internetbank", // Do not Use! If you do not customize the gateway list,
    // allowed_bin: "371598,371599,376947,376948,376949", // Do not Use! If you do not control on transaction
    // emi_max_inst_option: 3, // Max instalment Option
    // emi_allow_only: 0, // Value is 1/0, if value is 1 then only EMI transaction is possible
  });

  // Set customer info
  payment.setCusInfo({
    name: req.user.name,
    email: req.user.email,
    add1: address1,
    add2: address2,
    city: city,
    state: state,
    postcode: postcode,
    country: country,
    phone: phone,
    fax: phone,
  });

  // Set shipping info
  payment.setShippingInfo({
    method: "Courier", //Shipping method of the order. Example: YES or NO or Courier
    num_item: total_item,
    name: req.user.name,
    add1: address1,
    add2: address2,
    city: city,
    state: state,
    postcode: postcode,
    country: country,
  });

  // Set Product Profile
  payment.setProductInfo({
    product_name: "Bohubrihi E-Com Products",
    product_category: "General",
    product_profile: "general",
  });

  response = await payment.paymentInit();
  const order = new Order({
    cartItems: cartItems,
    user: userId,
    transaction_id: tran_id,
    address: profile,
  });
  if (response.status === "SUCCESS") {
    order.sessionKey = response["sessionkey"];
    await order.save();
  }
  return res.status(200).send(response);
};

module.exports.paymentSuccess = async (req, res) => {
  // res.sendFile(path.join(__basedir + "/public/success.html"));
  //   const successFilePath = path.resolve(__basedir, "public", "success.html");
  //   console.log("Success Path : ", successFilePath); // For debugging purposes
  //   res.sendFile(successFilePath);

  const successPage = `<div style="margin: 20px 0px; text-align: center">
      <p style="font-size: 25px; color: green">Your Payment Was Successful!</p>
      <a
        style="
          color: green;
          text-decoration: none;
          font-size: 20px;
          border: 2px solid gray;
          border-radius: 10px;
          padding: 10px;
          font-weight: bold;
        "
        href="https://ecom-frontend-steel.vercel.app/"
        >Go Back To Home</a
      >
    </div>`;

  res.send(successPage);
};

module.exports.paymentFail = async (req, res) => {
  // const failFilePath = path.resolve(__basedir, "public", "fail.html");
  // console.log(failFilePath); // For debugging purposes
  // res.sendFile(failFilePath);

  // res.sendFile(path.join(__basedir + "/public/fail.html"));

  const failPage = `<div style="margin: 20px 0px; text-align: center">
      <p style="font-size: 25px; color: red">Your Payment Has Failed!</p>
      <a
        style="
          color: green;
          text-decoration: none;
          font-size: 20px;
          border: 2px solid gray;
          border-radius: 10px;
          padding: 10px;
          font-weight: bold;
        "
        href="https://ecom-frontend-steel.vercel.app/cart"
        >Go Back To Cart</a
      >
    </div>`;

  res.send(failPage);
};

module.exports.paymentCancel = async (req, res) => {
  // const cancelFilePath = path.resolve(__basedir, "public", "cancel.html");
  // console.log(cancelFilePath); // For debugging purposes
  // res.sendFile(cancelFilePath);

  const cancelPage = `<div style="margin: 20px 0px; text-align: center">
      <p style="font-size: 25px; color: red">Your Payment Has Canceled!</p>
      <a
        style="
          color: green;
          text-decoration: none;
          font-size: 20px;
          border: 2px solid gray;
          border-radius: 10px;
          padding: 10px;
          font-weight: bold;
        "
        href="https://ecom-frontend-steel.vercel.app/cart"
        >Go Back To Cart</a
      >
    </div>`;

  res.send(cancelPage);
};
