//this file is boilerplate which uses the JSON JWT security approach to encrypt all data passing through the server and clients

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("./keys");
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;
const userCache = [];
module.exports = passport => {//takes the passport api and sets up authentication, checks if every auth is valid
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      if (!userCache[jwt_payload.id])
        User.findById(jwt_payload.id)
          .then(user => {
            if (user) {
              userCache[jwt_payload.id] = user;
              setTimeout(() => {
                delete userCache[jwt_payload.id]
              }, 60 * 60 * 1000);//make sure data is up to date by the hour
              return done(null, user);
            }
            return done(null, false);
          })
          .catch(err => {
            console.log(err)
          });
      else done(null, userCache[jwt_payload.id]);
    })
  );
};
