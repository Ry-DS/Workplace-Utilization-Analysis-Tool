const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const EVENT_TYPE = require('./../eventType');

//Structure:
//Team->Employees->usage data->Dates employee was on->Events triggered while at work->monitor plugins or login/offs
const MonitorEventSchema = new Schema({
  monitorGroup_id: {type: Number},//the object id of the monitor group interacted with
  type: {type: String, required: true, default: EVENT_TYPE.PLUG_IN},//if the event was a login to server or logout
  time: {type: Date, required: true,default: Date.now}//time monitor plugin/out event occurred
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
  creationDate: {type: Date, required: true, default: Date.now},
  startTime:{type:String, default: '00:00',required: true},
  endTime: {type: String,default: '23:59',required: true},
  employees: {
    type: [EmployeeSchema], default: []
  },
  color: {type: String, required: true, default: '#0b406c'}

});
module.exports = Team = mongoose.model("teams", TeamSchema);
