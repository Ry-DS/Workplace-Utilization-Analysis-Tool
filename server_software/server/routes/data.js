//route which highlights how certain paths in the backend should act.
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
//initial plan was to update the client on data changes, but it would prove too complex for the time frame


module.exports = router;
