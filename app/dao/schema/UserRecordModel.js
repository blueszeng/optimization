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
var UserRecordSchema = new Schema({
  uid: String,
  _user: { type: String, ref: 'user' },
  records:[Schema.Types.Mixed]
});


module.exports = mongoose.model("UserRecord", UserRecordSchema);