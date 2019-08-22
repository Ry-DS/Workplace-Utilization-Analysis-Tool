const passport = require('passport');

const express = require("express");
const router = express.Router();
// Load Monitor model
const MonitorGroup = require("../models/MonitorGroup");

const {routeBuffer} = require('../passport-config');//authenticate specific routes



//make everything a protected route. Only users with perms can perform operations here
router.use('/edit', (req, res, next) => {
  routeBuffer.push("editMonitors");
  next();
});
router.use('/edit', passport.authenticate('jwt', {session: false}));


router.post('/edit/delete', (req, res) => {//each route defined by its path and db action. Self explanatory
  const id = req.body.id;
  MonitorGroup.deleteOne({_id: id}).then(() => res.status(200).json({success: true})).catch(err => res.status(400).json(err));

});//for each db operation, we send response codes based on the outcome. A response is also needed or it isn't sent.
router.post('/edit', (req, res) => {
  const query = req.body;
  MonitorGroup.updateOne({_id: query.id}, {
    $set: {
      [query.type]: query.value,
      new: false

    }
  }).then(() => res.status(200).json({success: true})).catch(err => res.status(400).json(err));


});
router.post('/edit/replace', (req, res) => {
  const query = req.body;
  query.new = false;//ensure once an update is made, the monitor is no longer considered new.
  try {
    MonitorGroup.updateOne({_id: query._id}, {$set: query}).then(() => res.status(200).json({success: true}))
      .catch(err => {
        res.status(400).json(err);
        console.error(err)
      });
  } catch (e) {
    res.status(400).json(e);
    console.error(e);
  }
});
//list all data registered within the program
router.get("/edit/list", (req, res) => {
  const query = req.query;
  if (!query.id)
    MonitorGroup.find({}, (err, teams) => {
      res.send(teams);
    });
  else MonitorGroup.findOne({_id: query.id}, (err, team) => {
    if (!team) {
      res.status(400).send({failed: true});
    } else
      res.send(team);
  });

});

module.exports = router;
