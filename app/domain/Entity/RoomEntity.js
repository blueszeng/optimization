
var Sender = require("../Sender");
var RoomCloser = require("../RoomCloser");
var GameLogic = require("../Logic/GameLogic");
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require("pomelo");
const MAX_PLAYER = 4;
const GAME_TIMES = 8;
const LEAVE_REASON = {
	LRGameOver: 0,
	LRRoomClose: 1,
	LRSelfLeave: 2
}
class RoomEntity {

	constructor(roomID, channel, manager) {

		this.roomID = roomID;
		this.players = [];
		this.channel = channel;
		this.sender = new Sender(channel, this.players, roomID);
		this.manager = manager;
		this.active = false;
		this.game = new GameLogic(this.sender, this);
		this.level = 0;
		this.maxLevel = 0;
		this.isReady = false;

	}

	InitOption(option) {
		this.opt = option;
		var curGame = this.game;
		this.maxLevel = option.cost * GAME_TIMES;
		this.level = 0;
		this.isReady = false;
		this.IsClose = false;
		if (!this.game.Init(option)) {
			this.ClearRoom(LEAVE_REASON.LRSelfLeave);
			return false;
		}
		return true;
	}

	IsFull() {
		if (this.players.length < MAX_PLAYER)
			return false;
		for (var i = 0; i < MAX_PLAYER; i++)
			if (!this.players[i]) {
				return false;
			}
		return true;
	}

	AddPlayer(uid, sid, playerData) {
		var curIdx = 0;
		var players = this.players;
		var nobj = { uid: uid, idx: curIdx, ready: 0, info: playerData, ol: 1 };

		for (var i = 0; i < MAX_PLAYER; i++)
			if (!players[i]) {
				nobj.idx = i;
				players[i] = nobj;
				curIdx = i;
				break;
			}



		if (curIdx > 0) {
			this.PushMessage("OnAdd", nobj);
		}

		this.channel.add(uid, sid);
		this.ReadyGame(uid, 1);
	}

	ReadyGame(uid, ready) {
		var idx = this.GetIdxByUid(uid);
		if (idx < 0)
			return;
		if (this.isReady) {
			return;
		}
		var players = this.players;
		players[idx].ready = ready;
		this.PushReady();
		for (var i = MAX_PLAYER - 1; 0 <= i; i--) {
			if (!players[i] || players[i].ready == 0)
				return;
		}
		this.isReady = true;

		var self = this;
		setTimeout(() => {
			self.StartGame();
		}, 500);

	}

	PushReady() {
		var players = this.players;
		var pushObj = {};
		for (var i = MAX_PLAYER - 1; 0 <= i; i--) {
			if (!!players[i])
				pushObj[i] = players[i].ready;
			else pushObj[i] = 0;
		}
		//console.log(pushObj, players);
		this.PushMessage("OnReady", pushObj);
	}

	GameEnd() {
		//console.log("GameEnd", this.level, this.maxLevel);
		if (this.level >= this.maxLevel) {
			this.ClearRoom(LEAVE_REASON.LRGameOver);
			return;
		}
		var players = this.players;
		this.isReady = false;
		for (var i = MAX_PLAYER - 1; 0 <= i; i--) {
			players[i].ready = 0;
		}
		this.PushReady();
	}

	GetIdxByUid(uid) {
		var players = this.players;
		var i = players.length - 1;
		for (; 0 <= i; i--) {
			if (!!players[i] && players[i].uid == uid) {
				return i;
			}
		}
		return i;
	}

	UpdateNetStatus(idx, status) {
		var cur = this.players[idx];
		cur.ol = status;
		this.PushMessage("OnNet", { idx: idx, status: status });
	}

	CallRoomUpdate(obj) {
		this.PushMessage("OnRoomUpdate", obj);
	}

	CloseRoom(idx) {
		//console.log(this.closer);
		if (!!this.closer)
			return false;
		if (this.IsClose)
			return false;
		var self = this;
		//console.log("CloseRoom");
		this.closer = new RoomCloser(idx, () => {
			self.closer = null;
			self.PushMessage("OnChooseClose", {});
			self.ClearRoom(LEAVE_REASON.LRRoomClose);
		},
			() => {
				self.closer = null;
				self.PushMessage("OnChooseClose", {});
			});
		//console.log("pushMessage", this.closer.status);
		this.PushMessage("OnChoose", this.closer.status);
		return true;
	}

	AgreeClose(uid, ans) {
		if (!this.closer)
			return false;
		var idx = this.GetIdxByUid(uid);

		if (idx < 0)
			return false;

		if (!this.closer.SetStatus(idx, ans))
			return false;
		if (!!this.closer)
			this.PushMessage("OnChoose", this.closer.status);
		return true;
	}

	LeaveRoom(uid) {
		////console.log("id:111111: " + this.game.status, uid);
		if (this.game.status) {
			return this.CloseRoom(this.GetIdxByUid(uid));
		}
		var i = this.GetIdxByUid(uid);
		////console.log("id:111111: " + i);
		if (i < 0) {
			return false;
		}

		//解散房间
		if (i == 0) {
			this.ClearRoom(LEAVE_REASON.LRSelfLeave);
			return true;
		}

		this.players[i] = null;
		this.UserLevel(uid, LEAVE_REASON.LRSelfLeave);
		this.channel.leave(uid, this.channel.getMember([uid]).sid);
		this.PushMessage("OnLeave", { idx: i })
	}

	GetBaseInfo() {
		var ret = {
			id: this.roomID,
			opt: this.opt,
			level: this.level,
			maxLevel: this.maxLevel
		};

		var arr = [];
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i] == null) {
				arr[i] = { uid: "null", name: "" };
				continue;
			}
			arr[i] = {
				uid: this.players[i].uid,
				name: this.players[i].info.name
			};
		}
		ret.users = arr;
		return ret;
	}

	GetRoomInfo() {
		var ret = {
			id: this.roomID,
			opt: this.opt,
			users: this.players,
			level: this.level,
			maxLevel: this.maxLevel
		};

		if (this.closer)
			ret.closer = this.closer.status;
		else ret.closer = null;
		return ret;
	}

	GetRoomUpdate() {
		var ret = {
			level: this.level,
		}
		if (this.closer)
			ret.closer = this.closer.status;
		else ret.closer = null;

		return ret;
	}

	StartGame() {

		this.level++;


		// var self = this;
		// var ss = 0;
		// function countFnc()
		// {

		// 	self.PushMessage("shushu", {count:ss++});
		// 	setTimeout(countFnc, 100);
		// }
		// setTimeout(countFnc, 100);

		////console.log("StartGame", this.level);
		var curGame = this.game;
		curGame.Start(this.level);
		//第二局 游戏扣房主的房卡
		if (this.level == 2) {
			var uid = this.players[0].uid;
			pomelo.app.rpc.connector.userRemote.useCard.toServer(this.channel.getMember([uid]).sid, uid, this.opt.cost, function (err, ret) {
				if (!!err) {
					logger.error("useCard", err, ret);
				}
			});
		}
		// var players = this.players;
		// // channelService.pushMessageByUids('onChat', param, [{
		// // 	uid: tuid,
		// // 	sid: tsid
		// // }]);__channelService__
		// var channel = this.channel;
		// for(var i=0; i<players.length ; i++)
		// {
		// 	var info = curGame.GetGameInfo(i);
		// 	channel.__channelService__.pushMessageByUids("OnStart", info,[channel.records[players[i].uid]]);
		// }
	}

	OnOperation(uid, op, val) {
		for (var src in this.players) {
			if (this.players[src].uid == uid) {

				return this.game.OnOperation(src, op, val);
			}
		}
		return false;
	}

	GetGameInfo(uid) {
		for (var src in this.players) {
			if (this.players[src].uid == uid) {

				return this.game.GetGameInfo(src);
			}
		}
		return false;
	}

	GetGameUpdate(uid, sid) {
		for (var src in this.players) {
			if (this.players[src].uid == uid) {

				return this.game.GetGameUpdate(src, sid);
			}
		}
		return false;
	}

	UserLevel(uid, reason) {
		//console.log(this.channel.records);
		pomelo.app.rpc.connector.userRemote.leaveRoom.toServer(this.channel.getMember([uid]).sid, uid, reason, function (err, ret) {
			if (!!err) {
				logger.error("leaveRoom fial!", err, ret, uid);
			}
		});
	}

	ClearRoom(reason) {
		if (this.IsClose)
			return;
		if (this.game.status && reason != LEAVE_REASON.LRGameOver) {
			this.game.CloseGame();
		}
		var self = this;
		this.IsClose = true;
		//延迟1s钟关闭房间，立刻关闭房间许多消息无法到达
		var delay = 1000;
		if (reason == LEAVE_REASON.LRSelfLeave)
			delay = 0;
		setTimeout(() => {
			self.game.status = false;
			var players = self.players;
			for (var i = 0; i < MAX_PLAYER; i++)
				if (!!players[i]) {
					var uid = players[i].uid;
					self.UserLevel(uid, reason);
					var record = self.channel.getMember([uid]);
					if (!!record)
						self.channel.leave(uid, record.sid);
				}
			self.players.length = 0;
			self.closer = null;
			self.manager.ReleaseRoom(self.roomID);
		}, delay);
	}

	PushMessage(route, msg) {
		//console.log(route, msg);
		this.channel.pushMessage(route, msg, {}, function (err, ret) {
			if (!!err)
				logger.error("pushMessage fial!", err, ret);
		});

	}

}


module.exports = RoomEntity;