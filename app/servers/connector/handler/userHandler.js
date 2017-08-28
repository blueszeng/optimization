
var Code = require("../../../code/ErrorCode");
var PlayerDao = require("../../../dao/PlayerDao");
var tokenManager = require("../../../util/token");
var config = require("../../../../config/serverSettings.json");
var dispatcher = require("../../../util/dispatcher");
var routeUtil = require("../../../util/routeUtil");
var PlayerManager = require("../../../domain/Manager/PlayerManager");
var utils = require('../../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function (app) {
	return new Handler(app);
};

var sessionService;
var Handler = function (app) {
	this.app = app;
	this.gameRoomRemote;
	this.sid = app.getServerId();
	sessionService = this.app.sessionService;
	let self = this;
	setTimeout(() => {
		if (!self.gameRoomRemote) {
			self.gameRoomRemote = utils.rpcFuncPromisifyAll(self.app.rpc.game.roomRemote);
			logger.debug('cover game roomRetoe all func to promise obj');
		}	
	}, 1000)
};

function LoginFailedReturn(msg, session, next, step) {
	var address = sessionService.getClientAddressBySessionId(session.id)
	logger.warn(step, msg, address);
	next(null, { code: Code.LOGIN_FAILED });
}

Handler.prototype.Login = function (msg, session, next) {
	// body...
	var uid = msg.uid;
	var token = msg.token;
	if (!uid || !token) {
		LoginFailedReturn(msg, session, next, "Login failed No Arguments");
		return;
	}

	var tokenResult = tokenManager.parse(token, config.TokenPassword);
	if (!tokenResult) {
		LoginFailedReturn(msg, session, next, "Login failed wrong token");
		return;
	}
	if (this.sid != tokenResult.sid || uid != tokenResult.uid) {
		LoginFailedReturn(msg, session, next, "Login failed wrong sid or uid");
		return;
	}

	var self = this;
	// console.log(uid);
	PlayerDao.FindPlayerByUserID(uid)
		.then((playerEntity) => {
			if (!playerEntity) {
				logger.error("FindPlayerByUserID", err, playerEntity);
				next(null, { code: Code.INVALIDATE_USER });
				return;
			}
			if (uid == session.uid) {
				logger.warn("repeat Login", uid);
				next(null, playerEntity.GetUserInfo(true));
				return;
			}
			//判断登入的时间
			//console.log(new Date(playerEntity.userModel.lastLogin).getTime(), tokenResult.timestamp);
			if ((new Date(playerEntity.userModel.lastLogin).getTime()) != tokenResult.timestamp) {
				LoginFailedReturn(msg, session, next, "Login failed INVALIDATE timestamp");
				return;
			}

			var address = sessionService.getClientAddressBySessionId(session.id);
			playerEntity.SetIP(address.ip);

			sessionService.kick(uid, { code: Code.USER_LOGIN_SOMEWHERE }, function (kerr, ret) {
				if (err) {
					logger.error("kick error", kerr);
				}
			});

			session.bind(uid);
			session.on('closed', onUserLeave.bind(null, self.app));

			self.app.MessageManager.PostSingleMessage(session);
			var rid = PlayerManager.GetPlayerRoom(uid);
			if (!!rid) {
				session.set("rid", rid);
				session.push('rid', function (err) {
					if (err) {
						logger.error('set rid for session service failed! error is : %j', err.stack);
					}
				});

				var tsid = routeUtil.toGame(self.app, rid);
				return self.gameRoomRemote.checkRID(tsid, uid, rid)
					.then((ret) => {
						if (ret.ret) {
							next(null, playerEntity.GetUserInfo(true));
							return;
						}
						PlayerManager.SetPlayerRoom(uid, null);
						next(null, playerEntity.GetUserInfo(true));
					}).catch((err) => {
						logger.error("checkRID", err);
						next(null, playerEntity.GetUserInfo(true));
						return;
					});
			}
			else {
				next(null, playerEntity.GetUserInfo(true));
			}
		}).catch((err) => {
			logger.error("FindPlayerByUserID", err, playerEntity);
			next(null, { code: Code.INVALIDATE_USER });
			return;
		});

};

// self.app.rpc.game.roomRemote.checkRID.toServer(tsid, uid, rid, function (err, ret) {
// 	if (!!err) {
// 		logger.error("checkRID", err);
// 		next(null, playerEntity.GetUserInfo(true));
// 		return;
// 	}
// 	if (ret.ret) {
// 		next(null, playerEntity.GetUserInfo(true));
// 		return;
// 	}

// 	PlayerManager.SetPlayerRoom(uid, null);
// 	next(null, playerEntity.GetUserInfo(true));
// });


var onUserLeave = function (app, session, reason) {

	if (!session || !session.uid) {
		return;
	}
	var rid = session.get("rid");
	if (!!rid) {
		var tsid = routeUtil.toGame(app, rid);
		return self.gameRoomRemote.userLeave(tsid, session.uid, rid)
			.catch((err) => {
				logger.error('user leave error! %j', err);
				return;
			});

	}
};
// console.log("user leave :" + session.uid);
// app.rpc.game.roomRemote.userLeave.toServer(tsid, session.uid, rid, function (err, ret) {
// 	if (!!err) {
// 		logger.error('user leave error! %j', err);
// 	}
// });
//console.log(session);

// utils.myPrint('1 ~ OnUserLeave is running ...');
// app.rpc.area.playerRemote.playerLeave(session, {playerId: session.get('playerId'), instanceId: session.get('instanceId')}, function(err){
// 	if(!!err){
// 		logger.error('user leave error! %j', err);
// 	}
// });
// app.rpc.chat.chatRemote.kick(session, session.uid, null);



Handler.prototype.getUserInfo = function (msg, session, next) {

	var uid = session.uid;
	// if(!uid)
	// {
	// 	next(null, {code: Code.LOGIN_FIRST});
	// 	return;
	// }
	var playerEntity = PlayerManager.GetPlayer(uid);
	// if(!playerEntity)
	// {
	// 	next(null, {code: Code.FAIL});
	// 	return;
	// }
	next(null, playerEntity.GetUserInfo(true));
}


Handler.prototype.getUserUpdate = function (msg, session, next) {
	//console.log(msg);
	var uid = session.uid;
	// if(!uid)
	// {
	// 	next(null, {code: Code.FAIL});
	// 	return;
	// }
	var playerEntity = PlayerManager.GetPlayer(uid);
	// if(!playerEntity)
	// {
	// 	next(null, {code: Code.FAIL});
	// 	return;
	// }
	next(null, playerEntity.GetUpdateUserInfo());
}

Handler.prototype.getPublicMessage = function (msg, session, next) {

	next(null, this.app.MessageManager.GetMessage());
}

/**
 * 防止频繁访问出现bug
 * @type {Object}
 */
var LockPlayer = {

};

/**
 * 创建房间
 * @param  {object}   msg      request message包含cost，表示消耗多少房卡，opt是房间的设置参数
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
Handler.prototype.createRoom = function (msg, session, next) {
	var cost = msg.cost;
	var uid = session.uid;
	var opt = msg.opt;
	if ((cost !== 1 && cost !== 2 && cost !== 3) || typeof opt != "object" ||
		isNaN(opt.type) || isNaN(opt.ma) || isNaN(opt.gui) || isNaN(opt.wanfa) || isNaN(opt.hufa)) {
		logger.error("createRoom PARAMETER_ERROR", uid, opt, cost);
		next(null, { code: Code.PARAMETER_ERROR });
		return;
	}

	if (PlayerManager.GetPlayerRoom(uid)) {
		next(null, { code: Code.PLAYER_IN_ROOM });
		return;
	}
	var playerEntity = PlayerManager.GetPlayer(session.uid);

	if (!playerEntity.IsEnoughCard(cost)) {

		next(null, { code: Code.Card_NOT_ENOUGH });
		return;
	}
	var now = Date.now();
	if (!!LockPlayer[uid]) {
		if (now < LockPlayer[uid]) {
			next(null, { code: Code.VISIT_TOO_MUCH });
			return;
		}
	}
	LockPlayer[uid] = now + 3000;
	opt.cost = cost;
	this.gameRoomRemote.create(session, uid, this.app.get('serverId'), playerEntity.GetUserInfo(false), opt)
		.then(() => {
			if (!!ret.code) {
				next(null, ret);
				return;
			}
			PlayerManager.SetPlayerRoom(uid, ret.id);
			next(null, ret);

		}).catch((err) => {
			logger.error("createRoom", err);
			next(null, { code: Code.SERVER_IS_BUSY });
			return;
		});
}
// this.app.rpc.game.roomRemote.create(session, uid, this.app.get('serverId'), playerEntity.GetUserInfo(false), opt, function (err, ret) {
// 	if (!!err) {
// 		logger.error("createRoom", err);
// 		next(null, { code: Code.SERVER_IS_BUSY });
// 		return;
// 	}
// 	//LockPlayer[]
// 	if (!!ret.code) {
// 		next(null, ret);
// 		return;
// 	}
// 	PlayerManager.SetPlayerRoom(uid, ret.id);
// 	next(null, ret);
// });



Handler.prototype.joinRoom = function (msg, session, next) {
	var rid = msg.rid;
	var uid = session.uid;

	var playerEntity = PlayerManager.GetPlayer(session.uid);
	if (PlayerManager.GetPlayerRoom(uid)) {
		next(null, { code: Code.PLAYER_IN_ROOM });
		return;
	}
	//console.log("join room",rid);
	var now = Date.now();
	if (!!LockPlayer[uid]) {
		if (now < LockPlayer[uid]) {
			next(null, { code: Code.VISIT_TOO_MUCH });
			return;
		}
	}
	LockPlayer[uid] = now + 3000;

	var sid = routeUtil.toGame(this.app, rid);
	if (!sid) {
		next(null, { code: Code.NO_SUCH_ROOM });
		return;
	}
	this.gameRoomRemote.join(sid, uid, this.app.get('serverId'), rid, playerEntity.GetUserInfo(false))
		.then(() => {
			if (!!ret.code) {
				next(null, ret);
				return;
			}
			PlayerManager.SetPlayerRoom(uid, ret.id);
			next(null, ret);

		}).catch((err) => {
			logger.error("joinRoom", err);
			next(null, { code: Code.SERVER_IS_BUSY });
			return;
		});
}

// this.app.rpc.game.roomRemote.join.toServer(sid, uid, this.app.get('serverId'), rid, playerEntity.GetUserInfo(false), function (err, ret) {
// 	if (!!err) {
// 		logger.error("createRoom", err);
// 		next(null, { code: Code.SERVER_IS_BUSY });
// 		return;
// 	}
// 	//console.log( ret);
// 	if (!!ret.code) {
// 		next(null, ret);
// 		return;
// 	}
// 	PlayerManager.SetPlayerRoom(uid, ret.id);
// 	next(null, ret);
// });


Handler.prototype.getUserRecords = function (msg, session, next) {
	var uid = session.uid;
	this.app.RecordManager.GetUserRecordByUid(uid)
		.then((ret) => {
			next(null, { data: ret.records });
		}).then((v) => {
			logger.error("getUserRecords", err, ret);
			return next(null, { code: Code.DATABASE_FAILED });
		});
}

Handler.prototype.getRecord = function (msg, session, next) {
	var rid = msg.rid;
	var uid = session.uid;
	this.app.RecordManager.GetRecordByID(rid)
		.then((ret) => {
			if (ret == null) {
				logger.info("getRecord", rid);
				next(null, { code: Code.NO_RECORD });
				return;
			}
			next(null, {
				game: ret.game,
				date: ret.startDate,
				id: ret.id,
				oper: ret.oper,
				room: ret.room,
				result: ret.result
			});
		}).catch((err) => {
			logger.error("getRecord", err);
			next(null, { code: Code.DATABASE_FAILED });
			return;
		})
}

Handler.prototype.PushFeedBack = function (msg, session, next) {
	var uid = session.uid;
	var content = msg.content;
	var title = msg.title;
	this.app.MessageManager.PushFeedBack(uid, title, content)
	next(null, { code: Code.OK });
}