
var Code = require("../../../code/ErrorCode");
var RoomManager = require("../../../domain/Manager/RoomManager");

module.exports = function (app) {
	return new Handler(app);
};

var Handler = function (app) {
	this.app = app;
};

Handler.prototype.operation = function (msg, session, next) {
	var uid = session.uid;
	var rid = session.get("rid");
	var op = msg.op;
	var val = msg.val;

	//var before = Date.now();

	//console.log(uid, rid, op, val, this.app.getServerId());
	var room = RoomManager.GetRoom(rid);
	if (room.OnOperation(uid, op, val)) {
		//console.log("CreateUser",  Date.now()-before);
		next(null, { code: Code.OK });
	}
	else {
		//console.log(JSON.stringify(room.GetGameInfo(uid)));
		//console.log(JSON.stringify(room.GetRoomInfo()));
		//next(null, room.GetRoomInfo());
		//console.log("CreateUser",  Date.now()-before);
		next(null, { code: Code.PARAMETER_ERROR });
	}

}


Handler.prototype.getGameInfo = function (msg, session, next) {
	var uid = session.uid;
	var rid = session.get("rid");
	var room = RoomManager.GetRoom(rid);
	room.GetGameInfo(uid);
	next(null, room.GetGameInfo(uid));

}


Handler.prototype.getGameUpdate = function (msg, session, next) {
	var uid = session.uid;
	var rid = session.get("rid");
	var step = msg.step || 0;
	var room = RoomManager.GetRoom(rid);
	next(null, room.GetGameUpdate(uid, step));

}
