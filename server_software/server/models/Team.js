const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//Structure:
//Team->Employees->usage data->Dates employee was on->Events triggered while at work->monitor plugins or login/offs
const MonitorEventSchema = new Schema({
  monitorGroup_id: {type: String},//the object id of the monitor group interacted with
  wasCheckin: {type: Boolean, required: true, default: false},//if the event was a login to server or logout
  time: {type: String, required: true}//time monitor plugin/out event occurred
});
const WorkingDateSchema = new Schema({
  _id: {type: String, required: true},//date
  events: [MonitorEventSchema]


});

const EmployeeSchema = new Schema({
  _id: {type: String, required: true},//mac address of employees network card
  lastLogin: Date,
  usageData: [WorkingDateSchema]

});

// Create Schema
const TeamSchema = new Schema({
  name: {type: String, required: true},
  employees: {
    type: [EmployeeSchema]
  }
});
module.exports = Team = mongoose.model("teams", TeamSchema);
