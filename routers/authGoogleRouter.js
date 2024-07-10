const router = require("express").Router();
const passport = require("passport");
require("../config/authGoogleConfig");

router.route("/").get(
  passport.authenticate("google", {
    authType: "rerequest",
    scope: ["profile", "email"],
  })
);

router
  .route("/redirect")
  .get(passport.authenticate("google", { session: false }), (req, res) => {
    console.log(req.user);

    // res.send(req.user);
    res.redirect("http://localhost:3000/login/?token=" + req.user.token);
  });

module.exports = router;
