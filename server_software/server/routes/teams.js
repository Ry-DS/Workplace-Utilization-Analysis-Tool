const passport = require('passport');

const express = require("express");
const router = express.Router();
// Load input validation
const validateAddTeamInput = require("../validation/add_team");
// Load Team model
const Team = require("../models/Team");

const {routeBuffer} = require('../passport-config');//authenticate specific routes



//make everything a protected route. Only users with perms can perform operations here
router.use('/edit', (req, res, next) => {
  routeBuffer.push("editMonitors");
  next();
});
router.use('/edit', passport.authenticate('jwt', {session: false}));

router.post("/edit/create", (req, res) => {//begin registering from above method
  // Form validation
  const query = req.body;
  const {errors, isValid} = validateAddTeamInput(query);

// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Team.findOne({name: query.name}).then(team => {//otherwise, check if team exists
    if (team) {//if found, let user know
      return res.status(400).json({name: "Team already exists"});
    } else {//otherwise, add
      let team = new Team({name: query.name});
      team.save().then(team => {
        res.json({team});
      }).catch(err => console.log(err));


    }
  });

});

//list all teams and data registered within the program
router.get("/edit/list", (req, res) => {//TODO
  Team.find({}, (err, teams) => {
    res.send(teams);
  });

});

router.post('/edit/delete', (req, res) => {
  const id = req.body.id;
  Team.deleteOne({_id: id}).then(() => res.status(200).json({success: true})).catch(err => res.status(400).json(err));

});
router.post('/edit', (req, res) => {
  const query = req.body;
  if(query.type==='name'){//editing name, need to check it doesn't exist
  Team.findOne({name: query.value}).then((doc) => {
    if (doc) {
      res.status(400).json({name: 'Name already exists'});
    } else {
      Team.updateOne({_id: query.id}, {
        $set: {
          name: query.value
        }
      }).then(() => res.status(200).json({success: true})).catch(err => res.status(400).json(err));

    }
  });
  }else{
    Team.updateOne({_id: query.id},{$set:{
        [query.type]: query.value

      }}).then(()=>res.status(200).json({success: true})).catch(err=>res.status(400).json(err));

  }

});
module.exports = router;
