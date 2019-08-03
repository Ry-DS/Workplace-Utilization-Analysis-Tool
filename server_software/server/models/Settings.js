const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Settings
const SettingsSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  value: {type: Boolean, required: true, default: true}
});
module.exports = Settings = mongoose.model("settings", SettingsSchema);
