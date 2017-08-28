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

//define user Schema
var feedbackSchema = new Schema({
  uid: String,
  title: String,
  content: String,
  date: Number,
});

// userSchema.plugin(autoIncrement.plugin, {
//     model: 'user',
//     field: 'id',
//     startAt: 10000,
//     incrementBy: 1
// });

module.exports = mongoose.model("feedback", feedbackSchema);