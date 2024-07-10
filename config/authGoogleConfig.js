const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/user");
const _ = require("lodash");

const strategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/redirect",
  },
  async (accessToken, refreshToken, profile, cb) => {
    let user = await User.findOne({
      googleId: profile.id,
      email: profile._json.email,
    });
    if (user) {
      // console.log("User Exists : ", user);
      const token = user.generateJWT();
      const response = {
        user: _.pick(user, ["email", "_id"]),
        token: token,
      };

      cb(null, response);
    } else {
      user = new User({
        googleId: profile.id,
        email: profile._json.email,
        name: profile._json.name,
      });
      await user.save();
      // console.log("New User : ", user);

      const token = user.generateJWT();
      const response = {
        user: _.pick(user, ["email", "_id"]),
        token: token,
      };
      cb(null, response);
    }
  }
);

passport.use(strategy);
