
var RoomManager = require("../../../domain/Manager/RoomManager");
var Code = require("../../../code/ErrorCode");
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function (app) {
	return new roomRemote(app);
};

var roomRemote = function (app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

roomRemote.prototype.create = function (uid, sid, playerData, opt, cb) {
	//console.log("create room",this.app.getServerId());
	if (RoomManager.GetPlayerRoomID(uid)) {
		cb(null, { code: Code.PLAYER_IN_ROOM });
		return;
	}
	//console.log(uid, sid, opt);
	var room = RoomManager.CreateRoom();

	if (!room) {
		logger.error("no more room");
		cb(null, { code: Code.NO_MORE_ROOM });
		return;
	}
	//console.log(playerData);
	//
	var ret = room.InitOption(opt);
	if (!ret) {
		cb(null, { code: Code.ROOM_CREATE_FAIL });
		return;
	}
	room.AddPlayer(uid, sid, playerData);

	cb(null, room.GetRoomInfo());
}


roomRemote.prototype.join = function (uid, sid, rid, playerData, cb) {
	//console.log("join room",this.app.getServerId());
	var room = RoomManager.GetRoom(rid);
	if (!room) {
		cb(null, { code: Code.NO_SUCH_ROOM });
		return;
	}

	if (room.IsFull()) {
		var idx = room.GetIdxByUid(uid)
		if (idx >= 0) {
			cb(null, { ret: Code.OK, id: rid });
			return;
		}
		cb(null, { code: Code.ROOM_IS_FULL });
		return;
	}

	room.AddPlayer(uid, sid, playerData);
	cb(null, room.GetRoomInfo());
	//console.log("...");
}


roomRemote.prototype.checkRID = function (uid, rid, cb) {
	//console.log(this.app.getServerId());
	var room = RoomManager.GetRoom(rid);
	//console.log("checkRID", uid, rid, room);
	if (!!room) {
		var idx = room.GetIdxByUid(uid);
		if (idx >= 0) {
			room.UpdateNetStatus(idx, 1);
			cb(null, { ret: true });
			return;
		}
	}
	cb(null, { ret: false });
}



roomRemote.prototype.userLeave = function (uid, rid, cb) {
	var room = RoomManager.GetRoom(rid);
	//console.log("checkRID", uid, rid, room);
	if (!!room) {
		var idx = room.GetIdxByUid(uid);
		if (idx >= 0) {
			room.UpdateNetStatus(idx, 0);
			cb(null, { ret: true });
			return;
		}
	}
	cb(null, { ret: false });
}
