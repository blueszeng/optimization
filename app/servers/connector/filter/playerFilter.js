var logger = require('pomelo-logger').getLogger(__filename);
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

	var uid = session.uid;
	if(!uid)
	{
		var route = msg.__route__;
		if(route.search(/Login$/i) >= 0)
		{			
			next();
			return;
		}
		next({code: Code.LOGIN_FIRST});
		return;
	}
	var playerEntity = pomelo.app.PlayerManager.GetPlayer(uid);
	if(!playerEntity)
	{
		next({code: Code.LOGIN_FIRST});
		return;
	}

	next();
}


