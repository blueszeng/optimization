let logger = require('pomelo-logger');
let pomelo = require('pomelo');
let Code = require("../../../code/ErrorCode");

module.exports = function() {
	return new Filter();
};

let Filter = function() {
};

/**
 * Area filter
 */
Filter.prototype.before = function(msg, session, next){

	let uid = session.uid, rid = session.get('rid');
	//console.log("filter:", uid, rid);
	if(!uid || !rid)
	{
		
		next({code: Code.FAIL});
		return;
	}

	next();
}


