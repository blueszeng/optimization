
let dispatcher = require("./dispatcher");

let base = -1;
let length = 0;
let gameServers = null;

let toGame = function (app, rid) {
	if (base < 0) {
		gameServers = app.getServersByType('game');
		length = gameServers.length;
		base = Math.floor(899999 / gameServers.length);
	}

	let idx = Math.floor((rid - 100000) / base);
	if (idx < 0 || idx >= length) {
		return null;
	}
	return "cluster-server-game-" + idx;
};

exports.game = function (session, msg, app, cb) {
	let rid = session.get("rid");

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
	let game = dispatcher.dispatch(session.uid, gameServers);
	//console.log("gametoGame", game, msg, session.uid, gameServers);
	cb(null, game.id);
};

exports.toGame = toGame;