const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuotaScheme = new Schema({
  amount: Number,//amount of monitors available to this team set
  sharedWith: [Schema.Types.ObjectId]//teams quota is shared with. If more than one team, means these teams share the quota

});
//A monitor group is a like all monitors of a specific model, holds their unique id and info on how many there are.
const MonitorGroupSchema = new Schema({
  name: {
    type: String,//the specific model name the monitor has
    required: true
  },
  friendlyName: {//name given by the user
    type: String,
  },
  quota: [QuotaScheme]//quota is like the amount of these monitors in the building

});
module.exports = MonitorGroup = mongoose.model("monitor", MonitorGroupSchema);
