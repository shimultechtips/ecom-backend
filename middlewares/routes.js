const userRouter = require("../routers/userRouter");
const categoryRouter = require("../routers/categoryRouter");
const productRouter = require("../routers/productRouter");
const cartRouter = require("../routers/cartRouter");
const profileRouter = require("../routers/profileRouter");
const paymentRouter = require("../routers/paymentRouter");
const purchaseRouter = require("../routers/purchaseRouter");
const orderHistoryRouter = require("../routers/orderHistoryRouter");
const reviewRouter = require("../routers/reviewRouter");
const discountRouter = require("../routers/discountRouter");
const discountPercentageRouter = require("../routers/discountPercentageRouter");

module.exports = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/category", categoryRouter);
  app.use("/api/product", productRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/payment", paymentRouter);
  app.use("/api/purchase", purchaseRouter);
  app.use("/api/orderhistory", orderHistoryRouter);
  app.use("/api/review", reviewRouter);
  app.use("/api/discount", discountRouter);
  app.use("/api/discountpercentage", discountPercentageRouter);
};
