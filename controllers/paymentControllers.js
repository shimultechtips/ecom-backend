const { CartItem } = require("../models/cartItem");
const PaymentSession = require("ssl-commerz-node").PaymentSession;
const { Profile } = require("../models/profile");
const { Order } = require("../models/order");
const { Product } = require("../models/product");
const { Payment } = require("../models/payment");
const path = require("node:path");
const { DiscountPercentage } = require("../models/discountPercentage");
const axios = require("axios");

module.exports.ipn = async (req, res) => {
  if (req.body.status === "VALID") {
    const val_id = req.body.val_id;
    const store_id = process.env.STORE_ID;
    const store_passwd = process.env.STORE_PASSWORD;

    await axios
      .get(
        "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php",
        {
          params: {
            val_id: val_id,
            store_id: store_id,
            store_passwd: store_passwd,
          },
        }
      )
      .then(async (response) => {
        const payment = new Payment(req.body);
        const tran_id = payment["tran_id"];

        if (payment["status"] === "VALID") {
          const order = await Order.updateOne(
            { transaction_id: tran_id },
            { status: "Complete" }
          );

          const orderItems = await Order.findOne({ transaction_id: tran_id });

          orderItems.cartItems.map(async (item) => {
            const product = await Product.findOne({ _id: item.product }).select(
              {
                quantity: 1,
                sold: 1,
              }
            );

            product.quantity = product.quantity - item.count;
            product.sold = product.sold + item.count;

            try {
              await product.save();
            } catch (err) {
              console.log("product Save Failed : ", err);
            }
          });

          // await CartItem.deleteMany(order.cartItems);
        } else {
          await Order.deleteOne({ transaction_id: tran_id });
        }

        try {
          await payment.save();
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        console.log("Validation Error : ", err);
      });
  } else {
    console.log("IPN Request Body Error : ", req.body.error);
  }

  return res.status(200).send("IPN");
};

module.exports.initPayment = async (req, res) => {
  const userId = req.user._id;
  const cartItems = await CartItem.find({ user: userId });
  const profile = await Profile.findOne({ user: userId });
  const discountPercentage = await DiscountPercentage.findOne({ user: userId });
  let discountPrice;

  const { address1, address2, city, state, postcode, country, phone } = profile;

  const total_amount = cartItems
    .map((item) => item.count * item.price)
    .reduce((a, b) => a + b, 0);

  if (discountPercentage) {
    discountPrice =
      total_amount - (total_amount * discountPercentage.percentage) / 100;
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
    order.gateWayURL = response["GatewayPageURL"];
    order.amountToBePaid = discountPrice;

    try {
      await order.save();
    } catch (err) {
      console.log(err);
    }

    await CartItem.deleteMany({ user: userId });
  }

  try {
    await DiscountPercentage.deleteOne({
      user: userId,
    });
  } catch (err) {
    console.log(err.message);
  }

  return res.status(200).send(response);
};

module.exports.initPaymentOfCurrentOrders = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  const order = await Order.findOne({ _id: orderId, user: userId });

  console.log(order);

  const total_item = order.cartItems
    .map((item) => item.count)
    .reduce((a, b) => a + b, 0);

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
    total_amount: order.amountToBePaid, // Number field
    currency: "BDT", // Must be three character string
    tran_id: order.transaction_id, // Unique Transaction id
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
    add1: order.address.address1,
    add2: order.address.address2,
    city: order.address.city,
    state: order.address.state,
    postcode: order.address.postcode,
    country: order.address.country,
    phone: order.address.phone,
    fax: order.address.phone,
  });

  // Set shipping info
  payment.setShippingInfo({
    method: "Courier", //Shipping method of the order. Example: YES or NO or Courier
    num_item: total_item,
    name: req.user.name,
    add1: order.address.address1,
    add2: order.address.address2,
    city: order.address.city,
    state: order.address.state,
    postcode: order.address.postcode,
    country: order.address.country,
  });

  // Set Product Profile
  payment.setProductInfo({
    product_name: "Bohubrihi E-Com Products",
    product_category: "General",
    product_profile: "general",
  });

  response = await payment.paymentInit();

  if (response.status === "SUCCESS") {
    order.sessionKey = response["sessionkey"];
    order.gateWayURL = response["GatewayPageURL"];

    try {
      await order.save();
    } catch (err) {
      console.log(err);
    }
  }

  return res.status(200).send(response);
};

module.exports.paymentSuccess = async (req, res) => {
  res.redirect("https://ecom-frontend-steel.vercel.app/success");
};

module.exports.paymentFail = async (req, res) => {
  // const failFilePath = path.resolve(__basedir, "public", "fail.html");
  // console.log(failFilePath); // For debugging purposes
  // res.sendFile(failFilePath);

  // res.sendFile(path.join(__basedir + "/public/fail.html"));

  // const failPage = `<div style="margin: 20px 0px; text-align: center">
  //     <p style="font-size: 25px; color: red">Your Payment Has Failed!</p>
  //     <a
  //       style="
  //         color: green;
  //         text-decoration: none;
  //         font-size: 20px;
  //         border: 2px solid #ced4da;
  //         border-radius: 10px;
  //         padding: 10px;
  //         font-weight: bold;
  //       "
  //               href="https://ecom-frontend-steel.vercel.app/user/dashboard"

  //       >Go Back To Dashboard</a
  //     >
  //   </div>`;

  // res.send(failPage);
  res.redirect("https://ecom-frontend-steel.vercel.app/fail");
};

module.exports.paymentCancel = async (req, res) => {
  // const cancelFilePath = path.resolve(__basedir, "public", "cancel.html");
  // console.log(cancelFilePath); // For debugging purposes
  // res.sendFile(cancelFilePath);

  // const cancelPage = `<div style="margin: 20px 0px; text-align: center">
  //       <p style="font-size: 25px; color: red">Your Payment Has Canceled!</p>
  //       <a
  //         style="
  //           color: green;
  //           text-decoration: none;
  //           font-size: 20px;
  //           border: 2px solid #ced4da;
  //           border-radius: 10px;
  //           padding: 10px;
  //           font-weight: bold;
  //         "
  //         href="https://ecom-frontend-steel.vercel.app/user/dashboard"
  //         >Go Back To Dashboard</a
  //       >
  //     </div>`;
  //   res.send(cancelPage);
  res.redirect("https://ecom-frontend-steel.vercel.app/cancel");
};
