let Code = require("../../../code/ErrorCode");
let PlayerManager = require("../../../domain/Manager/PlayerManager");
let logger = null;
module.exports = function (app) {
	return new userRemote(app);
};

let userRemote = function (app) {
	this.app = app;
	this.sessionService = app.sessionService;
	logger = require('pomelo-logger').getLogger(__filename);
};

userRemote.prototype.leaveRoom = function (uid, reason, cb) {

	let player = PlayerManager.SetPlayerRoom(uid, null);
	let session = PlayerManager.GetPlayerSession(uid);
	//console.log("user leaveRoom", session);
	if (!!session) {
		//console.log("user leaveRoom", uid);
		this.app.components.__connector__.send(null, "OnRoomClose", { room: 0, reason: reason }, [session.id], null, function (err) {

		});
		//session.send({route:"OnRoomClose", data: {room:0}});
		//this.useCard(uid, 0, ()=>{});
		//console.log("user leaveRoom  ss");
	}
	//let session = this.sessionService.getByUid(uid);
	//console.log("remote arive", player, session);
	cb(null, { code: Code.OK });
}


userRemote.prototype.useCard = function (uid, cost, cb) {
	//console.log(this.sessionsessionsession);
	//console.log("useCard", uid, cost);
	let player = PlayerManager.GetPlayer(uid);
	player.CostCard(cost);
	let session = PlayerManager.GetPlayerSession(uid);
	if (!!session) {
		//console.log("OnCardUpdate", player.playerModel.cardNum);
		this.app.components.__connector__.send(null, "OnCardUpdate", { cardNum: player.playerModel.cardNum }, [session.id], null, function (err) {
			if (!!err) {
				logger.error("OnCardUpdate: ", err, data);
			}
		});
	}
	//let session = this.sessionService.getByUid(uid);
	//console.log("remote arive", player, session);
	cb(null, { code: Code.OK });
}

userRemote.prototype.addCard = function (uid, cost, cb) {
	//console.log("useCard", uid, cost);
	let self = this;
	PlayerManager.MustGetPlayer(uid)
		.then((player) => {
			return AddCard(cost);
		}).then((ret) => {
			cb(ret);
			let session = PlayerManager.GetPlayerSession(uid);
			if (!!session) {
				//console.log("OnCardUpdate", player.playerModel.cardNum);
				self.app.components.__connector__.send(null, "OnCardUpdate", { cardNum: player.playerModel.cardNum }, [session.id], null, function (err) {
					if (!!err) {
						logger.error("OnCardUpdate: ", err, data);
					}
				});
			}
		}).catch((err) => {
			return cb(err);
		})
}

userRemote.prototype.addRecord = function (uid, info, cb) {

	this.app.RecordManager.GetUserRecordByUid(uid)
		.then((userRecord) => {
			if (userRecord == null) {
				cb({ code: Code.NO_RECORD });
				return;
			}
			userRecord.records.unshift(info);
			userRecord.markModified('records');
			userRecord.save()
				.catch((err) => {
					logger.error("userRecord save: ", err, data);
				});
			cb(null, { code: Code.OK });
		}).catch((err) => {
			return cb({ code: Code.DATABASE_FAILED });
		});

}
