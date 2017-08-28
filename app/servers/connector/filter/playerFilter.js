let logger = require('pomelo-logger').getLogger(__filename);
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

	let uid = session.uid;
	if(!uid)
	{
		let route = msg.__route__;
		if(route.search(/Login$/i) >= 0)
		{			
			next();
			return;
		}
		next({code: Code.LOGIN_FIRST});
		return;
	}
	let playerEntity = pomelo.app.PlayerManager.GetPlayer(uid);
	if(!playerEntity)
	{
		next({code: Code.LOGIN_FIRST});
		return;
	}

	next();
}


