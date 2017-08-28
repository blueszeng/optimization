var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
/*
schema type
String
Number
Date
Buffer
Boolean
Mixed
ObjectId
Array
*/

//define player Schema
var playerSchema = new Schema({
  uid: String,
  _user: { type: String, ref: 'user' },
  cardNum: Number,
  ip: String,
  //massage: []
});

// playerSchema.plugin(autoIncrement.plugin, {
//     model: 'player',
//     field: 'id',
//     startAt: 10000,
//     incrementBy: 1
// });

module.exports = mongoose.model("player", playerSchema);