

let RecordModel = require("../../dao/schema/RecordModel");
let logger = require('pomelo-logger').getLogger(__filename);
let OperationResult = require("./LogicConst").OperationResult;
function Recorder() {

	let operators = [];
	let myRecord = null;

	const RecorderOpt = {
		CHOOSE: 0,
		RESULT: 1
	};

	let initGlobe = false;
	let totalRecords =
		{
			players: [],
			records: [],
			final: []
		};

	return {
		InitTotal: function (players, room) {
			let arr = [];
			for (let i = 0; i < players.length; i++) {
				arr.push({ name: players[i].info.name, uid: players[i].uid });
			}
			totalRecords.players = arr;
			totalRecords.room = room;
		},
		Init: function (roomInfo, gameInfo) {
			if (!initGlobe) {
				this.InitTotal(roomInfo.users, roomInfo.id);
				initGlobe = true;
			}
			myRecord = new RecordModel({});
			myRecord.room = roomInfo;
			myRecord.markModified('mixed');

			myRecord.game = gameInfo;
			myRecord.markModified('game');
			myRecord.startDate = Date.now();
			myRecord.save(function (err, data) {
				if (!!err)
					logger.error("Recorder first save: ", err, data);
			});
			//logger.error("init");
			operators = [];
		},
		AddOperation: function (op, idx, val) {
			operators.push({ t: RecorderOpt.CHOOSE, o: op, i: idx, v: val });
			return operators.length;
		},
		AddResult: function (op, idx, val) {
			operators.push({ t: RecorderOpt.RESULT, o: op, i: idx, v: val });
			return operators.length;
		},
		SaveResult: function (result) {
			if (!myRecord)
				return;
			myRecord.date = Date.now();
			myRecord.oper = operators;
			myRecord.markModified('oper');
			myRecord.result = result;
			myRecord.markModified('result');
			myRecord.save(function (err, data) {
				if (!!err)
					logger.error("Recorder save: ", err, data);
			});

			totalRecords.records.push({
				rid: myRecord.id, date: myRecord.startDate,
				edate: Date.now(), score: result.score.round
			});
			//console.log("SaveResult count:" + totalRecords.records.length);
			totalRecords.final = result.score.final;

			this.lastRecord = myRecord;
			myRecord = null;
		},
		GetOperationTo: function (idx, sid) {
			let ret = { arr: [], result: null };

			let tmp = myRecord || this.lastRecord;
			if (tmp && tmp.result) {
				ret.result = tmp.result;
			}
			//console.log(tmp, operators);
			let arr = ret.arr;
			//console.log(sid, operators)
			for (let i = sid + 1, len = operators.length; i < len; i++) {
				let cur = operators[i];
				if (cur.t == RecorderOpt.CHOOSE && cur.i != idx)
					continue;

				let nobj = { idx: cur.i, op: cur.o, val: cur.v, s: i };
				if (cur.o == OperationResult.Draw && cur.i != idx)
					nobj.val = -1;
				arr.push(nobj);
			}

			return ret;
		},
		GetRoomRecord: function () {
			return totalRecords;
		}
	};
}


module.exports = Recorder;










