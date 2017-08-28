var mongoose = require('mongoose');
var Schema = mongoose.Schema;
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


// const operations =
// {
// 	noplay: 0,
// 	play : 1,
// 	peng : 2,
// 	gang : 3,
// 	minggang : 4,
// 	angang : 5,
// 	judge : 6, 
// }

// {
// 	players:[{uid:uid, score:score, name, sex, headimage}];


// 	operations:[
// 		{t:1,v:1},
// 		{t:2,v:1},
// 	]

// }

var playerSchema = new Schema({
  id: String,
  date: { type: Date, default: Date.now },
  player:
});


module.exports = mongoose.model("player", playerSchema);