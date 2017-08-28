var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//define config Schema
var configSchema = new Schema({
  id: String,
  name: String,
  startid: Number,
  currentid: Number
});


module.exports = mongoose.model("Config", configSchema);