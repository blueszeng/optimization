
var Code = require("../../../code/ErrorCode");
var tokenManager = require("../../../util/token");
var config = require("../../../../config/serverSettings.json");
var dispatcher = require("../../../util/dispatcher");
var RoomManager = require("../../../domain/Manager/RoomManager");

module.exports = function (app) {
	return new Handler(app);
};

var Handler = function (app) {
	this.app = app;
};



Handler.prototype.leaveRoom = function (msg, session, next) {
	var rid = session.get('rid');
	var room = RoomManager.GetRoom(rid);
	var uid = session.uid;
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
	var uid = session.uid;
	var rid = session.get('rid');
	var room = RoomManager.GetRoom(rid);
	var sel = msg.sel;
	if (!sel || !room) {
		next(null, { code: Code.FAIL });
		return;
	}
	room.AgreeClose(uid, sel);
	next(null, { code: Code.OK });
}

Handler.prototype.ready = function (msg, session, next) {
	var uid = session.uid;
	var ready = msg.ready || 0;
	var rid = session.get('rid');
	var room = RoomManager.GetRoom(rid);
	if (!room) {
		next(null, { code: Code.NO_SUCH_ROOM });
		return;
	}
	room.ReadyGame(uid, ready);
	next(null, { code: Code.OK });
}

Handler.prototype.getRoomInfo = function (msg, session, next) {
	var rid = session.get('rid');
	var room = RoomManager.GetRoom(rid);

	next(null, room.GetRoomInfo());
}

Handler.prototype.getRoomUpdate = function (msg, session, next) {
	var rid = session.get('rid');
	var room = RoomManager.GetRoom(rid);

	next(null, room.GetRoomUpdate());
}

