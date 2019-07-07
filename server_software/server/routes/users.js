const passport = require('passport');

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../keys");

// Load input validation
const validateRegistrationInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
// Load User model
const User = require("../models/User");

const {routeBuffer, userCache} = require('../passport-config');//authenticate specific routes

// @route POST api/users/register
// @desc Register user
// @access Public
router.use('/register', (req, res, next) => {
  User.count({}, (err, count) => {
    if (count === 0) {
      req.body.firstUser = true;
      next();
    } else {
      routeBuffer.push('editUsers');
      passport.authenticate('jwt', {session: false})(req, res, next);
    }
  })
});
router.post("/register", (req, res) => {
  // Form validation
  const query = req.body;
  const {errors, isValid} = validateRegistrationInput(query);

// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const addUser = (firstUser, query) => {
    const permissions = {
      editMonitors: firstUser,
      editSettings: firstUser,
      editUsers: firstUser
    };
    const newUser = new User({
      name: query.name,
      email: query.email.toLowerCase(),
      password: query.password,
      permissions
    });
// Hash password before saving in database
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user => res.json({name: user.name, email: user.email.toLowerCase()}))
          .catch(err => console.log(err));
      });
    });
  };
  if (req.body.firstUser)
      addUser(true, query);
    else
      User.findOne({email: query.email.toLowerCase()}).then(user => {
        if (user) {
          return res.status(400).json({email: "Email already exists"});
        } else {
          addUser(false, query);

        }
      });

});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation
  const query = req.body;
  const {errors, isValid} = validateLoginInput(query);
// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = query.email.toLowerCase();
  const password = query.password;
// Find user by email
  User.findOne({email}).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({email: "Email not found"});
    }
// Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };
// Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 24*60*60// 24 hours
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
        user.lastLogin = Date.now();

        user.save(err => {//better way instead of making two requests? Like returning within this current method?
          if (err) {
            console.log(`Failed to update user ${user.email} last login: `);
            console.log(err);
          }
        });
        userCache.remove(user.id);//make sure the user is refreshed from security once logged in
      } else {
        return res
          .status(400)
          .json({password: "Password incorrect"});
      }
    });
  });
});

//next two statements make everything under /edit a protected route. Only users with EDIT_USERS permission can use these actions
router.use('/edit', (req, res, next) => {
  routeBuffer.push("editUsers");
  next();
});
router.use('/edit', passport.authenticate('jwt', {session: false}));
//list all users registered within the program
router.get("/edit/list", (req, res) => {
  User.find({}, (err, users) => {
    users.map(user => {
      user.password = undefined;//the client doesnt need this
      return user;
    });
    res.send(users);
  });

});

router.post('/edit/permission', (req, res) => {
  const query = req.body;


  User.updateOne({_id: query.id}, {
    $set: {
      [`permissions.${query.type}`]: query.value
    }
  }).then(() => res.status(200).json({success: true})).catch(err => res.status(400).json(err));

});
module.exports = router;
