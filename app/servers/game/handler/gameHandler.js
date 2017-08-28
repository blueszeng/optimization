
let Code = require("../../../code/ErrorCode");
let RoomManager = require("../../../domain/Manager/RoomManager");

module.exports = function (app) {
	return new Handler(app);
};

let Handler = function (app) {
	this.app = app;
};

Handler.prototype.operation = function (msg, session, next) {
	let uid = session.uid;
	let rid = session.get("rid");
	let op = msg.op;
	let val = msg.val;

	//let before = Date.now();

	//console.log(uid, rid, op, val, this.app.getServerId());
	let room = RoomManager.GetRoom(rid);
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
	let uid = session.uid;
	let rid = session.get("rid");
	let room = RoomManager.GetRoom(rid);
	room.GetGameInfo(uid);
	next(null, room.GetGameInfo(uid));

}


Handler.prototype.getGameUpdate = function (msg, session, next) {
	let uid = session.uid;
	let rid = session.get("rid");
	let step = msg.step || 0;
	let room = RoomManager.GetRoom(rid);
	next(null, room.GetGameUpdate(uid, step));

}
