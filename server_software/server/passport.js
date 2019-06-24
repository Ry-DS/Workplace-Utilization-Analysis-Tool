//this file is boilerplate which uses the JSON JWT security approach to encrypt all data passing through the server and clients

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const Account = mongoose.model("accounts");
const keys = require("../config/keys");
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;
module.exports = passport => {//takes the passport api and sets up authentication
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      Account.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};
