const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PermissionScheme = new Schema({
  editMonitors: {type: Boolean, required: true, default: false},//default permissions are nothing
  editUsers: {type: Boolean, required: true, default: false},
  editSettings: {type: Boolean, required: true, default: false},


});
// User account to access data,
const UserSchema = new Schema({//typical things an account would have
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
  permissions: {//outlines what the user can and can't do on the website
    type: PermissionScheme,
    required: true
  }
});
module.exports = User = mongoose.model("users", UserSchema);
