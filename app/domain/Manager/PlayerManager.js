/*
用于缓存用户
*/
let PlayerEntity = require("../Entity/PlayerEntity")
let logger = require('pomelo-logger').getLogger(__filename);

class PlayerManager {
	constructor() {
		this.count = 0;
		this.roomCached = {};

		this.players = {};
		this.app = null;
	}

	Init(application) {
		this.app = application;
	}
	CreatePlayer(userModel, playerModel) {
		let player = new PlayerEntity(userModel, playerModel, this);
		this.players[userModel.id] = player;
		return player;
	}
	GetPlayer(uid) {
		return this.players[uid];
	}
	MustGetPlayer(uid, cb) {
		return new Promise((resolve, reject) => {
			if (this.players[uid]) {
				return resolve(this.players[uid]);
			}
			let PlayerDao = require("../../dao/PlayerDao");
			PlayerDao.FindPlayerByUserID(uid)
			.then((playerEntity) => {
				if (!!playerEntity) {
					return resolve(playerEntity);
				}
				return reject({ code: 1 });
			}).catch((err) => {
				return reject({ code: 1 });
			});
		});
	}
	GetPlayerRoom(uid) {
		//console.log("GetPlayerRoom", roomCached, uid);
		return this.roomCached[uid];
	}
	SetPlayerRoom(uid, rid) {
		if (this.roomCached[uid] === null) {
			this.count++;
		}
		let session = this.GetPlayerSession(uid);
		if (!!session) {
			session.set("rid", rid);
			session.toFrontendSession().push("rid", null, function (err) {
				if (err) {
					logger.error('set rid for session service failed! error is : %j', err.stack);
				}
			});
		}
		this.roomCached[uid] = rid;
	}
	GetPlayerSession(uid) {
		let sessions = this.app.sessionService.getByUid(uid);
		//console.log(sessions);
		if (!sessions || sessions.length == 0) {
			return null;
		}
		let session = sessions[0];
		return session;
	}
	IsInRoom(uid) {
		return !!this.roomCached[uid];
	}
}

module.exports = new PlayerManager();