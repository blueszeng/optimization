var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require("pomelo");
var OperationResult = require("./Logic/LogicConst").OperationResult;
function Sender(chan, arrPlayers, rid) {
	var room = rid;
	var channel = chan;
	var Service = chan.__channelService__;
	var players = arrPlayers;
	var recorder = null;
	return {
		SetRecorder: function (target) {
			recorder = target;
		},
		SendGameStart: function (idx, info) {
			//console.log("SendGameStart",channel.records, idx, players);
			Service.pushMessageByUids("OnStart", info, [channel.records[players[idx].uid]], {}, function (err, ret) {
				if (!!err) {
					logger.error("OnStart", info, err, ret);
				}
			});
			// var channel = this.channel;
			// for(var i=0; i<players.length ; i++)
			// {
			// 	var info = curGame.GetGameInfo(i);
			// 	channel.__channelService__.pushMessageByUids("OnStart", info,[channel.records[players[i].uid]]);
			// }
		},
		SendOperation: function (idx, op, val) {

			var s = recorder.AddOperation(op, idx, val);
			// logger.info("op",{op:op, val:val, s:s});
			Service.pushMessageByUids("OnCall", { op: op, val: val, s: s }, [channel.records[players[idx].uid]], {}, function (err, ret) {
				if (!!err) {
					logger.error("OnCall", { op: op, val: val, s: s }, err, ret);
				}
			});
		},
		SendOperationResult: function (idx, op, val) {
			var s = recorder.AddResult(op, idx, val);
			//console..log({idx: idx, op:op, val:val, s:s});

			// logger.info("Result", {idx: idx, op:op, val:val, s:s});
			channel.pushMessage("OnPlay", { idx: idx, op: op, val: val, s: s }, {}, function (err, ret) {
				if (!!err) {
					logger.error("OnPlay", { idx: idx, op: op, val: val, s: s }, err, ret);
				}
			});
		},
		SendOperationDraw: function (idx, val) {

			var others = [];
			for (var i in players) {
				if (i == idx)
					continue;

				others.push(channel.records[players[i].uid]);
			}
			var s = recorder.AddResult(OperationResult.Draw, idx, val);
			// logger.info("draw", {idx:idx, val:val, s:s});
			Service.pushMessageByUids("OnDraw", { idx: idx, val: -1, s: s }, others, {}, function (err, ret) {
				if (!!err) {
					logger.error("OnDraw", { idx: idx, s: s }, err, ret);
				}
			});
			Service.pushMessageByUids("OnDraw", { idx: idx, val: val, s: s }, [channel.records[players[idx].uid]], {}, function (err, ret) {
				if (!!err) {
					logger.error("OnDraw", { idx: idx, val: val, s: s }, err, ret);
				}
			});

		},
		SendGameResult: function (result) {
			channel.pushMessage("OnEnd", result, {}, function (err, ret) {
				if (!!err) {
					logger.error("OnEnd", result, err, ret);
				}
			});
			recorder.SaveResult(result);
			// var simpleReccord = 
			// console.log("SendGameResult",simpleReccord);
			// var arr = [];
			// for(var i=0; i<arrPlayers.length; i++)
			// {
			// 	arr.push({name: players[i].info.name, uid:players[i].uid, score: players[i].score });
			// }
			// simpleReccord.players = arr;
			// simpleReccord.room = room;
			// for(var i=0; i<arrPlayers.length; i++)
			// {
			// 	var uid = players[i].uid
			// 	pomelo.app.rpc.connector.userRemote.addRecord(channel.records[uid].sid, uid, simpleReccord,function(ret){
			// 	//console..log("addRecord",ret);
			// 	});
			// }
		},
		SenderToSave: function () {
			var simpleReccord = recorder.GetRoomRecord();
			//console..log("SenderToSave",simpleReccord);
			for (var i = 0; i < players.length; i++) {
				var uid = players[i].uid
				pomelo.app.rpc.connector.userRemote.addRecord.toServer(channel.records[uid].sid, uid, simpleReccord, function (err, ret) {
					if (!!err) {
						logger.error("addRecord", err, ret, simpleReccord);
					}
				});
			}
		}
	}

}

module.exports = Sender;