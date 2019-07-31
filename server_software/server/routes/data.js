const passport = require('passport');

const express = require("express");
const router = express.Router();
// Load Team model
const Team = require("../models/Team");
const MonitorGroup = require('../models/MonitorGroup');

//auth list teams route
router.use('/', passport.authenticate('jwt', {session: false}));
//list all teams and data registered within the program
router.get("/list", (req, res) => {//TODO
  Team.find({}, (err, teams) => {

    MonitorGroup.find({}, (err, monitors) => {
      res.send({teams, monitors});
    });

  });

});
//Team.watch().on('change',data=>console.log(data));


module.exports = router;
