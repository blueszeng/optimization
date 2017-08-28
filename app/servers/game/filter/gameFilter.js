var logger = require('pomelo-logger');
var pomelo = require('pomelo');
var Code = require("../../../code/ErrorCode");

module.exports = function() {
	return new Filter();
};

var Filter = function() {
};

/**
 * Area filter
 */
Filter.prototype.before = function(msg, session, next){

	var uid = session.uid, rid = session.get('rid');
	//console.log("filter:", uid, rid);
	if(!uid || !rid)
	{
		
		next({code: Code.FAIL});
		return;
	}

	next();
}


