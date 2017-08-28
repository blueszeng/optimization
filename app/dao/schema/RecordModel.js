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


var recordSchema = new Schema({
  id: String,
  startDate: Number,
  date: Number,
  room: Schema.Types.Mixed,
  game: Schema.Types.Mixed,
  oper: Schema.Types.Mixed,
  result: Schema.Types.Mixed,
});

recordSchema.plugin(autoIncrement.plugin, {
    model: 'record',
    field: 'id',
    startAt: 1000000,
    incrementBy: 1
});

module.exports = mongoose.model("record", recordSchema);