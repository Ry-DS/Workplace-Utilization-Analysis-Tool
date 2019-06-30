const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const TeamSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  employees: {
    type: Array,
    required: true
  }
});
module.exports = Account = mongoose.model("teams", TeamSchema);
