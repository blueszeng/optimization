
const LastCounter =
	{
		WuGuiHuPai: 0,
		YouGuiHuPai: 1,
		MingGang: 2,
		AnGang: 3,
		ZhongMa: 4
	}

function ScoreCount(arrPlayers) {
	var players = arrPlayers;
	var roundCouter = [];
	var gen = -1;
	var thingsCoutner = []
	return {
		StartInit: function () {
			thingsCoutner = [[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]];
		},
		Init: function () {
			roundCouter = [0, 0, 0, 0];
			gen = -1;
		},
		FromGen: function (host) {
			gen = host;
			for (var i = players.length - 1; 0 <= i; i--) {
				if (host == i) {
					//players[i].score -= 3;
					roundCouter[i] -= 3;
				}
				else {
					//players[i].score += 1;
					roundCouter[i] += 1;
				}
			}
			//console.log("frogen", host, roundCouter);
		},
		FromOne: function (idx, fromIdx, point) {

			// players[idx].score += point;
			// players[fromIdx].score -= point;
			roundCouter[idx] += point;
			roundCouter[fromIdx] -= point;
			//console.log("FromOne", idx, fromIdx, point, roundCouter);
		},
		FromAll: function (idx, point) {
			//console.log("FromAll", idx, point, roundCouter);
			for (var i = players.length - 1; 0 <= i; i--) {
				if (idx == i) {
					//players[i].score += point*3;
					roundCouter[i] += point * 3;
				}
				else {
					//players[i].score -= point;
					roundCouter[i] -= point;
				}
			}
		},
		CountGang: function (idx, isAn) {
			if (isAn) {
				thingsCoutner[idx][3] += 1;
			}
			else {
				thingsCoutner[idx][2] += 1;
			}

		},
		CountHu: function (idx, isHu, ma) {
			//console.log("CountHu", idx, isHu, ma, thingsCoutner);
			thingsCoutner[idx][4] += ma;
			if (isHu) {
				thingsCoutner[idx][0] += 1;
			}
			else {
				thingsCoutner[idx][1] += 1;
			}
		},
		GetFinalCount: function () {
			return thingsCoutner;
		},
		GetRoundCounter: function () {
			var scoreArr = [0, 0, 0, 0];
			for (var i = players.length - 1; 0 <= i; i--) {
				players[i].score += roundCouter[i];
				scoreArr[i] = players[i].score;
			}
			var retRound = roundCouter;
			roundCouter = [0, 0, 0, 0];
			return { final: scoreArr, round: retRound, gen: gen };
		}
	}

}

module.exports = ScoreCount;