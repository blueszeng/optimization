
let Code = require("../../../code/ErrorCode");
let tokenManager = require("../../../util/token");
let config = require("../../../../config/serverSettings.json");
let dispatcher = require("../../../util/dispatcher");
let RoomManager = require("../../../domain/Manager/RoomManager");

module.exports = function (app) {
	return new Handler(app);
};

let Handler = function (app) {
	this.app = app;
};



Handler.prototype.leaveRoom = function (msg, session, next) {
	let rid = session.get('rid');
	let room = RoomManager.GetRoom(rid);
	let uid = session.uid;
	//console.log("..............&&&&&&&&&&&&&&&&&&&&&");
	//console.log(this.app.getServerId());
	//console.log("leaveRoom", rid, uid, room);

	if (!rid || !room) {
		next(null, { code: Code.FAIL });
		return;
	}
	// this.app.rpc.connector.userRemote.leaveRoom(session.frontendId, uid,function(err, ret){
	// 	if(err || ret.code)
	// 	{
	// 		next(err, ret);
	// 		return;
	// 	}
	// 	console.log(err, ret);
	// });
	room.LeaveRoom(uid);
	next(null, { code: Code.OK });
}


Handler.prototype.agreeClose = function (msg, session, next) {
	let uid = session.uid;
	let rid = session.get('rid');
	let room = RoomManager.GetRoom(rid);
	let sel = msg.sel;
	if (!sel || !room) {
		next(null, { code: Code.FAIL });
		return;
	}
	room.AgreeClose(uid, sel);
	next(null, { code: Code.OK });
}

Handler.prototype.ready = function (msg, session, next) {
	let uid = session.uid;
	let ready = msg.ready || 0;
	let rid = session.get('rid');
	let room = RoomManager.GetRoom(rid);
	if (!room) {
		next(null, { code: Code.NO_SUCH_ROOM });
		return;
	}
	room.ReadyGame(uid, ready);
	next(null, { code: Code.OK });
}

Handler.prototype.getRoomInfo = function (msg, session, next) {
	let rid = session.get('rid');
	let room = RoomManager.GetRoom(rid);

	next(null, room.GetRoomInfo());
}

Handler.prototype.getRoomUpdate = function (msg, session, next) {
	let rid = session.get('rid');
	let room = RoomManager.GetRoom(rid);

	next(null, room.GetRoomUpdate());
}

