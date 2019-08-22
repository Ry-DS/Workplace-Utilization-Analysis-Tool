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
//a 400 status means the client is sending invalid data.
// a 401 means the client is unauthorised to perform a specific action.
// a 200 means everything is ok and there are no errors on either side.



// @route POST api/users/register
// @desc Register user
// @access Public
router.use('/register', (req, res, next) => {//register middleware defining different behaviour based if a user already exists
  User.count({}, (err, count) => {//check how many users registered currently
    if (count === 0) {//if there are none, means its the first user, so..
      req.body.firstUser = true;//let the next method check for it,
      next();//execute next method, no authentication required.
    } else {//otherwise
      routeBuffer.push('editUsers');//ensure user has edit permissions
      passport.authenticate('jwt', {session: false})(req, res, next);//and also if they are authorised and logged in.
    }
  })
});
router.post("/register", (req, res) => {//begin registering from above method
  // Form validation
  const query = req.body;
  const {errors, isValid} = validateRegistrationInput(query);

// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  //method to add user
  const addUser = (firstUser, query) => {
    const permissions = {//if they are the first user, they should have access to everything. otherwise, nothing
      //first user calculated when doing security
      editMonitors: firstUser,
      editSettings: firstUser,
      editUsers: firstUser
    };
    const newUser = new User({//setup new user
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
          .save()//save to database and let registeree know.
          .then(user => res.json({name: user.name, email: user.email.toLowerCase()}))
          .catch(err => console.log(err));
      });
    });
  };
  if (req.body.firstUser)//if first user, don't need to check if a conflicting user exists
      addUser(true, query);
    else
    User.findOne({email: query.email.toLowerCase()}).then(user => {//otherwise, check
      if (user) {//if found, let user know
          return res.status(400).json({email: "Email already exists"});
      } else {//otherwise, add like before with differing attributes.
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
          permissions: user.permissions
        };
// Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 24 * 60 * 60// 24 hours, afterwards, user must login again
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
      } else {//otherwise, password must be incorrect
        return res
          .status(400)
          .json({password: "Password incorrect"});
      }
    });
  });
});

//next two statements make everything under /edit a protected route. Only users with editUsers can perform operations here
router.use('/edit', (req, res, next) => {//
  routeBuffer.push("editUsers");
  for (let usr in userCache)//we want to clear the cache since users have been edited and permissions may be different
    delete userCache[usr];
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
router.post('/edit/delete', (req, res) => {
  const id = req.body.id;
  User.deleteOne({_id: id}).then(() => res.status(200).json({success: true})).catch(err => res.status(400).json(err));

});
module.exports = router;
