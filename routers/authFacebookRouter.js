const router = require("express").Router();
const passport = require("passport");
require("../config/authFacebookConfig");

router.route("/").get(
  passport.authenticate("facebook", {
    scope: [
      "public_profile",
      "email",
      "user_hometown",
      "user_gender",
      "user_birthday",
      "user_link",
    ],
  })
);

router
  .route("/redirect")
  .get(passport.authenticate("facebook", { session: false }), (req, res) => {
    // console.log(req.user);
    res.send(req.user);
  });

module.exports = router;
