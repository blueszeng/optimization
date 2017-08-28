
var dispatcher = require("./dispatcher");

var base = -1;
var length = 0;
var gameServers = null;

var toGame = function (app, rid) {
	if (base < 0) {
		gameServers = app.getServersByType('game');
		length = gameServers.length;
		base = Math.floor(899999 / gameServers.length);
	}

	var idx = Math.floor((rid - 100000) / base);
	if (idx < 0 || idx >= length) {
		return null;
	}
	return "cluster-server-game-" + idx;
};

exports.game = function (session, msg, app, cb) {
	var rid = session.get("rid");

	if (!!rid) {
		rid = Number(rid);
		cb(null, toGame(app, rid));
		return;
	}
	if (base < 0) {
		gameServers = app.getServersByType('game');
		length = gameServers.length;
		base = Math.floor(899999 / gameServers.length);
	}
	var game = dispatcher.dispatch(session.uid, gameServers);
	//console.log("gametoGame", game, msg, session.uid, gameServers);
	cb(null, game.id);
};

exports.toGame = toGame;