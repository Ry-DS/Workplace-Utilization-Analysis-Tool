const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: ''
  },
  permissions:{
    type: Array,
    default: [],
    required: true
    //TODO
  }
});
module.exports = Account = mongoose.model("users", UserSchema);
