let Operation = require("./Operation");
let WinnerChecker = require("./WinnerChecker");
let ScoreCount = require("../ScoreCount");
let GameRecord = require("./GameRecord");
let logger = require('pomelo-logger').getLogger(__filename);
/*
0-34 分别表示1-9万 1-9柄 1-9锁 东南西北中发白

*/

let LogicConst = require('./LogicConst');
let HuFa = LogicConst.HuFa;
let OperationResult = LogicConst.OperationResult;
let GameType = LogicConst.GameType;
let StartPoint = LogicConst.StartPoint;
let CheckHuFa = LogicConst.CheckHuFa;
let WanFa = LogicConst.WanFa;
let maxPlayer = LogicConst.MaxPlayer;

let GameLogic = function (msgSender, roomEntity) {
	let sender = msgSender;
	let room = roomEntity;
	let players = [];
	let scoreCount = new ScoreCount(players);
	let gameRecord = null;
	let cards = [];
	let option;
	let currentIdx = 0;
	let lastPlay = -1;

	let maKeeper = [];

	let host;
	let lastHost = 0;
	let ma = 0; // 无码 二码 四码 六码
	let gui = -1; //鬼牌 无-1  白板33  翻鬼0-33
	let xuangui;

	//倍率
	let rate = {
		qidui: 0,		//七对
		shisan: 0,		//十三幺
		qingyise: 0,	//清一色
		quanfeng: 0,	//全风
		yaojiu: 0,		//幺九
		pengpenghu: 4,	//碰碰胡
		siguihupai: 0,	//四鬼胡牌
		zimo: 2,		//自摸
	};

	//玩法
	let gameWay = {};
	let myOperation = new Operation();
	// 	const WanFa =
	// {
	// 	meiwan: 1,
	// 	meibing: 2,
	// 	meisuo: 4,
	// 	meizi: 8,
	// 	qiangaang: 16,
	// 	gangbaoquanbao: 64,
	// 	zanpaiquanbao: 128,
	// 	genpai: 256
	// }
	//
	let huInfo = {};
	let PengLock = {};
	let QuanBaoRecord = {};	//全包的记录关系
	let zanpaiRecord = {};	//沾牌的记录关系
	//跟牌的三个数值  分别是跟庄的状态 数值  统计
	let genZhuang = true;
	let genValue = -1;
	let genCount = 0;
	//杠上杠
	let lianGang = -1;
	//如果等于鬼牌自动排到数组前面
	function SortParam(a, b) {
		if (a === gui)
			return -1;
		if (b === gui) return 1;
		return a - b;
	}

	let nextAction = null;
	let startObj = null;
	return {
		status: false,
		Init: function (opt) {
			gameWay = {};
			let hufa = Number(opt.hufa);
			let ways = HuFa;
			switch (opt.type) {
				case GameType.jihu:
					rate = {
						zimo: 2,
						duiduihu: 2,
						haidi: 2,
						qiang: 2,
						wuguijiabei: 2,
					};
					for (let src in CheckHuFa)
						if (!(hufa & ways[src]))
							rate[src] = 0;
					break;
				case GameType.yibaizhang:
					rate = {
						zimo: 2,
						duiduihu: 2,
						siguihupai: 2,
						shisan: 16,
						qingyise: 4,
						quanfeng: 16,
						yaojiu: 8,
						wuguijiabei: 2,
						chihu: 2,
						haidi: 0,
						hunyise: 2,
						qingdui: 8,
						quanyao: 16,
						hundui: 4,
						qiang: 2,
					};
					for (let src in CheckHuFa)
						if (!(hufa & ways[src]))
							rate[src] = 0;
					break;
				case GameType.ningdu:
					rate = {
						zimo: 2,
						duiduihu: 2,
						qidui: 2
					};
					gameWay.ningdu = true;
					for (let src in CheckHuFa)
						if (!(hufa & ways[src]))
							rate[src] = 0;
					break;
				case GameType.xinxing:
					rate = {
						zimo: 2
					};

					for (let src in CheckHuFa)
						if (!(hufa & ways[src]))
							rate[src] = 0;
					break;
				default:
					return false;
			}
			lastHost = 0;
			option = opt;
			host = 0;//opt.host || 0;
			ma = opt.ma || 0;

			xuangui = false;
			if (opt.gui == 1) {
				gui = 33;
			}
			else if (opt.gui == 2) {
				xuangui = true;
				gui = -1;
			}
			else {
				gui = -1;
			}

			let curWanfa = Number(opt.wanfa);
			for (let src in WanFa) {
				if (curWanfa & WanFa[src]) {
					gameWay[src] = true;
					////console.log(src);
				}
			}
			if (opt.type == GameType.yibaizhang) {
				gameWay.meiwan = true;
				gameWay.yibaizhang = true;
				gameWay.qianggang = true;
			}
			if (gameWay.qianggangquanbao)
				gameWay.qianggang = true;
			//console.log("gameWay",gameWay, curWanfa, WanFa);
			for (let i = 0; i < maxPlayer; i++) {
				players[i] = {
					card: [],
					his: [],
					heap: [],
					score: StartPoint
				};
			}
			scoreCount.StartInit();
			gameRecord = new GameRecord();
			sender.SetRecorder(gameRecord);
			return true;
		},
		Start: function (level) {
			this.status = true;
			PengLock = {};
			QuanBaoRecord = {};
			zanpaiRecord = {}
			huInfo = {};
			scoreCount.Init();
			let cardCategory = 34;
			let countCards = 0;
			cards = [];
			for (let i = 0; i < cardCategory; i++) {
				if (i < 9 && !!gameWay.meiwan && (!gameWay.yijiuwan || (i != 0 && i != 8))) {
					continue;
				}
				countCards++;
				cards.push(i);
				cards.push(i);
				cards.push(i);
				cards.push(i);
			}

			for (let i = 0, len = cards.length; i < len; i++) {
				let rd = Math.floor(Math.random() * len);
				let tmp = cards[rd];
				cards[rd] = cards[i];
				cards[i] = tmp;
			}



			maKeeper = [];
			for (let i = ma * 2 - 1, j = cards.length - 1; 0 <= i; i--) {
				maKeeper[i] = cards[j];
				j--;
			}


			for (let i = 0; i < maxPlayer; i++) {
				players[i].card = cards.splice(0, 13).sort(SortParam);
				players[i].his = [];
				players[i].heap = [];
			}
			host = lastHost;
			genZhuang = true;
			genCount = 0;
			genValue = -1;
			lianGang = -1;
			// startObj = {"0":[8,9,9,14,14,15,18,20,23,23,25,29,29],"1":[0,8,8,16,17,17,19,19,20,21,22,23,27],"2":[33,0,12,13,16,17,19,20,21,26,27,27,28],"3":[8,9,11,13,14,15,19,20,21,21,25,28,32],"cards":[26,33,22,15,10,22,31,24,18,28,14,25,24,16,10,12,33,0,31,12,24,26,0,25,31,30,17,32,12,28,11,18,30,30,32,10,10,30,9,22,11,13,11,27,29,26,31,15,32,33,13,29,23,18,24,16]}


			// for(let i=0; i<4;i++)
			// 	players[i].card = startObj[i];
			// cards = startObj.cards;
			// cards = [9,20,21,27,33,18,0,8,13,31,24,25,16,23,32,30,22,29,33,14,28,29,12,8,0,25,21,0,29,28,11,21,10,30,15,22,14,30,10,29,26,15,28,13,16,10,32,12,14,25,11,32,13,9,10,24];
			// players[0].card = [3,3,3, 15, 16, 9, 9]
			// players[1].heap = [{t:0, v:14}];
			// players[1].card = [4,4,4,5,5,17,16];
			//  players[2].card = [0,0,0,2];
			//  players[3].card =  [10,10,10,15,16,17,17,18,19,20,25,30,29];
			// cards = [19, 14, 6, 8, 8, 8, 8,8,8,8];
			// players[0].card = [3]
			// players[1].card = [3]
			// players[2].card = [3]
			// players[3].card = [3]
			// cards = [32,32,32,32,30];
			// logger.info("\n["+cards+"]");
			// logger.info("\n"+players[0].card+"]");
			// logger.info("\n"+players[1].card+"]");
			// logger.info("\n"+players[2].card+"]");
			// logger.info("\n"+players[3].card+"]");
			// logger.info(host);
			if (xuangui) {
				this.XuanGui(countCards, cardCategory);
			}
			myOperation.ClearOperation();

			gameRecord.Init(room.GetRoomInfo(), this.GetGameInfo(-1, true));
			for (let i = 0; i < players.length; i++) {
				let info = this.GetGameInfo(i);
				info.level = level;
				sender.SendGameStart(i, info);
			}

			currentIdx = host;
			this.GetACard(currentIdx);
		},
		XuanGui: function (countCards, cardCategory) {
			let xuan = Math.floor(Math.random() * countCards);
			let trueXuan = 0;
			for (let i = 0; i < cardCategory; i++) {
				if (i < 9 && !!gameWay.meiwan && (!gameWay.yijiuwan || (i != 0 && i != 8))) {
					continue;
				}
				if (xuan == 0) {
					switch (i) {
						case 0:
							if (!!gameWay.meiwan && !!gameWay.yijiuwan)
								trueXuan = 8;
							break;
						case 8:
							trueXuan = 0
							break;
						case 17:
							trueXuan = 9;
							break;
						case 26:
							trueXuan = 18;
							break;
						case 33:
							trueXuan = 27;
							break;
						default:
							trueXuan = i + 1;
							break;
					}
					break;
				}
				xuan--;
			}
			gui = trueXuan;
		},
		//胡牌后开马
		OpenMa: function (isQiangGang) {

			if (isQiangGang) {
				//抢杠 没有选抢杠
				if (!gameWay.qghfanbei)
					isQiangGang = false;
			}
			let curMa = ma;
			if (isQiangGang) {
				curMa *= 2;
			}
			let hash = {};
			for (let i = 0; i < maxPlayer; i++) {
				if (!!huInfo[i]) {
					huInfo[i].zhong = [];
				}
			}
			if (curMa != maKeeper.length) {
				maKeeper = maKeeper.slice(ma);
			}

			//console.log(maKeeper, maKeeper.length);
			for (let i = 0; i < maKeeper.length; i++) {
				let curIdx = ((maKeeper[i] % 9) % maxPlayer + host) % maxPlayer;
				if (!!huInfo[curIdx]) {
					huInfo[curIdx].zhong.push(i);
				}
			}
		},
		GetACard: function (idx, isGang) {
			//game over 
			if (cards.length <= 0) {
				this.EndGame();
				return;
			}
			currentIdx = idx;
			let val = cards.shift();
			//console.log("before get card", players[idx].card);
			players[idx].card.push(val);
			// console.log("after get card", players[idx].card);
			myOperation.ClearOperation();
			let ret = this.CheckGangorAnGang(val);

			lastPlay = val;
			let winResult = this.CheckWin(idx);
			if (!!gameWay.gangbaoquanbao && winResult) {
				if (isGang !== undefined) {
					//console.log("i am here!", isGang);
					winResult.way |= HuFa.quanbao;
					QuanBaoRecord[idx] = isGang;
				}
				else if (lianGang > -1) {
					winResult.way |= HuFa.quanbao;
					QuanBaoRecord[idx] = lianGang;
				}
			}
			sender.SendOperationDraw(idx, val);
			if (ret >= 0)
				val = ret;
			if (!myOperation.GetOperation(idx)) {
				//console.log("not has operation get card");
				myOperation.AddOperation(idx, OperationResult.Play);
				this.ContinuePlay();
			}
			else {	//console.log("has operation get card", myOperation.GetOperation(idx));
				myOperation.AddOperation(idx, OperationResult.None);
				sender.SendOperation(idx, myOperation.GetOperation(idx), val);
				let self = this;
				nextAction = () => {
					self.ContinuePlay();
				};
			}

		},
		ContinuePlay: function () {
			myOperation.ClearOperation();
			myOperation.AddOperation(currentIdx, OperationResult.Play);
			sender.SendOperation(currentIdx, OperationResult.Play, lastPlay);
		},
		OnOperation: function (idx, op, val) {
			idx = Number(idx);
			op = Number(op);
			val = Number(val);
			if (!myOperation.CheckOperation(idx, op)) {
				return false;
			}
			//console.log("OnOperation", idx, op, val);
			switch (op) {
				case OperationResult.None:
					//console.log("play none!");
					gameRecord.AddResult(OperationResult.None, idx, -1);
					let curOp = myOperation.GetOperation(idx);
					if (curOp & OperationResult.Hu) {
						myOperation.ClearSingleOperation(idx);
						huInfo[idx] = null;
						if (myOperation.CheckAllOperation()) {
							return true;
						}

						if (this.CheckEnd())
							return true;

					}
					if (curOp & OperationResult.Peng) {
						if (!PengLock[idx])
							PengLock[idx] = [];
						PengLock[idx].push(lastPlay);
					}
					//console.log("nextAction none!", nextAction);
					nextAction && nextAction();
					//nextAction = null;
					return true;


				case OperationResult.Play:
					return this.PlayCard(idx, val);

				case OperationResult.Peng:
					return this.Peng(idx, val);

				case OperationResult.DianGang:
					return this.DianGang(idx, val);

				case OperationResult.MingGang:
					return this.MingGang(idx, val);

				case OperationResult.AnGang:
					return this.AnGang(idx, val);
				case OperationResult.Hu:
					return this.HuPai(idx, val);
			}
			return false;
		},
		GetGameInfo: function (idx, needAll = false) {
			//console.log(idx);
			let ret = {
				host: host,
				gui: gui,
				jian: zanpaiRecord,
				remain: cards.length,
				players: []
			};
			for (let i = 0; i < players.length; i++) {
				if (idx == i || needAll)
					ret.players.push(JSON.parse(JSON.stringify(players[i])));
				else {
					ret.players.push(
						{
							card: players[i].card.length,
							his: players[i].his,
							heap: players[i].heap,
							score: players[i].score
						}
					);
				}
			}
			let op = myOperation.GetOperation(idx);
			if (!!op) {
				ret.op = { op: op, val: lastPlay };
			}
			ret.startObj = startObj;
			return ret;
		},
		GetGameUpdate: function (idx, sid) {
			return gameRecord.GetOperationTo(idx, sid);
		},
		PlayCard: function (idx, cardValue) {
			let cardIdx = players[idx].card.indexOf(cardValue);
			//console.log("play start", cardIdx, players[idx].card);
			if (cardIdx < 0)
				return false;

			if (genZhuang) {
				if (genValue == -1) {
					genValue = cardValue;
					genCount++;
				}
				else if (cardValue == genValue) {
					genCount++;
				}
				else genZhuang = false;

				if (genCount == 4) {
					scoreCount.FromGen(host);
					genZhuang = false;
				}
			}
			lianGang = -1;
			PengLock[idx] = null;
			lastPlay = cardValue;
			//console.log("play start", players[idx].card);
			players[idx].card.splice(cardIdx, 1);
			////console.log("after start", players[idx].card);
			players[idx].card.sort(SortParam);
			players[idx].his.push(cardValue);
			sender.SendOperationResult(idx, OperationResult.Play, cardValue);
			////console.log("play compelete", lastPlay);
			myOperation.ClearOperation();

			if (!!gameWay.yibaizhang) {
				let checkRet = this.CheckAllChiHu(idx, cardValue);
				//console.log("CheckAllChiHu", checkRet);
				let self = this;
				if (checkRet) {
					//console.log("play compelete has operation", lastPlay);
					myOperation.ForEachOperation(function (i, op) {
						sender.SendOperation(i, op, cardValue);
					});
					nextAction = function () {
						myOperation.ClearOperation();
						self.PlayCardContinue(cardValue);
					};
					return true;
				}

			}

			//console.log("play compelete do not operation", players[idx].card);
			this.PlayCardContinue(cardValue);

			return true;
		},
		PlayCardContinue: function (cardValue) {
			this.CheckPengOrDianGang();
			//console.log("check end curIdx", currentIdx);
			if (myOperation.CheckAllOperation()) {
				//console.log("has operation");
				let self = this;
				nextAction = () => {
					myOperation.ClearOperation();
					self.NextPlayer();
				};
				myOperation.ForEachOperation(function (i, op) {
					sender.SendOperation(i, op, cardValue);
				});
			}
			else {
				//console.log("do not has operation");
				this.NextPlayer();
			}
			return true;
		},
		NextPlayer: function () {
			//console.log("bNextPlayer", currentIdx,maxPlayer);
			currentIdx = (currentIdx + 1) % maxPlayer;
			//console.log("fNextPlayer", currentIdx);
			this.GetACard(currentIdx);
		},
		Peng: function (idx, val) {
			if (genZhuang) {
				genZhuang = false;
			}
			let curPlayer = players[idx];
			let cardArr = players[idx].card;
			for (let i = 0; i < cardArr.length; i++) {
				if (cardArr[i] == lastPlay) {
					cardArr.splice(i, 2);
				}
			}
			let history = players[currentIdx].his;
			history.splice(history.length - 1, 1);

			if (!!gameWay.zanpaiquanbao && cardArr.length == 2) {
				//QuanBaoRecord[idx] = currentIdx;
				zanpaiRecord[idx] = currentIdx;

				sender.SendOperationResult(idx, OperationResult.Jian, currentIdx);
			}

			currentIdx = idx;
			curPlayer.heap.push({ t: 0, v: lastPlay });
			sender.SendOperationResult(idx, OperationResult.Peng, lastPlay);
			myOperation.ClearOperation();
			myOperation.AddOperation(idx, OperationResult.Play);
			sender.SendOperation(idx, OperationResult.Play, -1);
			return true;
		},
		DianGang: function (idx, val) {
			//console.log("diangang before", cardArr);
			if (genZhuang) {
				genZhuang = false;
			}
			let curPlayer = players[idx];
			let cardArr = players[idx].card;

			let history = players[currentIdx].his;
			history.splice(history.length - 1, 1);

			for (let i = 0; i < cardArr.length; i++) {
				if (cardArr[i] == lastPlay) {
					cardArr.splice(i, 3);
				}
			}
			if (!!gameWay.zanpaiquanbao && cardArr.length == 1) {
				//QuanBaoRecord[idx] = currentIdx;
				zanpaiRecord[idx] = currentIdx;
				sender.SendOperationResult(idx, OperationResult.Jian, currentIdx);
			}
			let lastIdx = currentIdx;
			currentIdx = idx;

			//console.log("diangang after", cardArr);
			curPlayer.heap.push({ t: 1, v: lastPlay });
			sender.SendOperationResult(idx, OperationResult.DianGang, lastPlay);
			myOperation.ClearOperation();
			if (gameWay.ningdu) {
				this.CheckQiangGang(idx, val);
			}
			if (myOperation.CheckAllOperation()) {
				let self = this;
				nextAction = () => {
					scoreCount.FromOne(idx, lastIdx, 3);
					scoreCount.CountGang(idx, false);
					if (gameWay.gangshanggang) {
						lianGang = lastIdx;
					}
					self.GetACard(idx, lastIdx);
				};
				myOperation.ForEachOperation(function (i, op) {
					sender.SendOperation(i, op, val);
				});
			}
			else {
				scoreCount.FromOne(idx, lastIdx, 3);
				scoreCount.CountGang(idx, false);
				if (gameWay.gangshanggang) {
					lianGang = lastIdx;
				}
				this.GetACard(idx, lastIdx);
			}
			return true;
		},
		MingGang: function (idx, val) {

			let curPlayer = players[idx];
			let cardArr = players[idx].card;
			let heap = players[idx].heap;
			let j = 0;
			for (; j < heap.length; j++) {
				if (heap[j].v == val)
					break;
			}
			if (j == heap.length) {
				return false
			}
			for (let i = cardArr.length - 1; 0 <= i; i--) {
				if (cardArr[i] == val) {
					cardArr.splice(i, 1);
					break;
				}
			}
			if (genZhuang) {
				genZhuang = false;
			}
			heap[j].t = 2;
			//修改bug 选择胡 或者 明杠的时候选择了杠要清huinfo的状态
			huInfo[idx] = null;
			sender.SendOperationResult(idx, OperationResult.MingGang, val);
			myOperation.ClearOperation();
			this.CheckQiangGang(idx, val);
			if (myOperation.CheckAllOperation()) {
				let self = this;
				nextAction = () => {
					if (zanpaiRecord[i] != undefined) {
						scoreCount.FromOne(idx, zanpaiRecord[i], 3);
					}
					else if (lianGang > -1) {
						scoreCount.FromOne(idx, lianGang, 3);
					}
					else {
						scoreCount.FromAll(idx, 1);
					}
					scoreCount.CountGang(idx, false);
					self.GetACard(idx);
				};
				myOperation.ForEachOperation(function (i, op) {
					sender.SendOperation(i, op, val);
				});
			}
			else {
				if (zanpaiRecord[i] != undefined) {
					scoreCount.FromOne(idx, zanpaiRecord[i], 3);
				}
				else if (lianGang > -1) {
					scoreCount.FromOne(idx, lianGang, 3);
				}
				else {
					scoreCount.FromAll(idx, 1);
				}
				//scoreCount.FromAll(idx, 1);
				scoreCount.CountGang(idx, false);
				this.GetACard(idx);
			}

			return true;
		},
		AnGang: function (idx, val) {
			let curPlayer = players[idx];
			let cardArr = players[idx].card;
			let count = 0;
			for (let i = cardArr.length - 1; 0 <= i; i--) {
				if (cardArr[i] == val) {
					count++;
				}
			}
			if (count != 4) {
				return false;
			}
			if (genZhuang) {
				genZhuang = false;
			}
			for (let i = cardArr.length - 1; 0 <= i; i--) {
				if (cardArr[i] == val) {
					cardArr.splice(i, 1);
				}
			}
			if (!!gameWay.zanpaiquanbao && cardArr.length == 1 && lianGang > -1) {
				//QuanBaoRecord[idx] = currentIdx;
				zanpaiRecord[idx] = lianGang;
				sender.SendOperationResult(idx, OperationResult.Jian, lianGang);
			}

			//修改bug 选择胡 或者 明杠的时候选择了杠要清huinfo的状态
			huInfo[idx] = null;
			curPlayer.heap.push({ t: 3, v: val });
			sender.SendOperationResult(idx, OperationResult.AnGang, val);
			myOperation.ClearOperation();
			if (!!gameWay.yibaizhang) {
				let hasHu = this.CheckAnGangQiangGang(idx, val);
				if (hasHu) {
					let self = this;
					nextAction = () => {
						if (lianGang > -1) {
							scoreCount.FromOne(idx, lianGang, 6);
						}
						else {
							scoreCount.FromAll(idx, 2);
						}
						scoreCount.CountGang(idx, true);
						self.GetACard(idx);
					};
					myOperation.ForEachOperation(function (i, op) {
						sender.SendOperation(i, op, val);
					});
					return true;
				}
			}
			if (lianGang > -1) {
				scoreCount.FromOne(idx, lianGang, 6);
			}
			else {
				scoreCount.FromAll(idx, 2);
			}
			scoreCount.CountGang(idx, true);
			this.GetACard(idx);
			return true;
		},
		HuPai: function (idx) {
			if (genZhuang) {
				genZhuang = false;
			}
			let ret = myOperation.ClearSingleOperation(idx);
			if (myOperation.CheckAllOperation()) {
				return true;
			}
			return this.CheckEnd();

		},
		EndGame: function () {
			let allPlayersCards = [];

			for (let i = maxPlayer - 1; 0 <= i; i--) {
				allPlayersCards[i] = players[i].card;
			}
			let result = {
				score: scoreCount.GetRoundCounter(),
				hu: null,
				cards: allPlayersCards
			};
			if (room.level >= room.maxLevel) {
				result.final = this.GetFinal();
			}
			sender.SendGameResult(result);
			if (room.level >= room.maxLevel) {
				sender.SenderToSave();
			}
			room.GameEnd();
		},
		CloseGame: function () {
			let allPlayersCards = [];

			for (let i = maxPlayer - 1; 0 <= i; i--) {
				allPlayersCards[i] = players[i].card;
			}
			let result = {
				score: scoreCount.GetRoundCounter(),
				hu: null,
				final: this.GetFinal(),
				cards: allPlayersCards
			};
			sender.SendGameResult(result);
			sender.SenderToSave();
		},
		CheckEnd: function () {
			if (myOperation.CheckAllOperation()) {
				return false;
			}
			let ret = false;
			let isQiangGang = false;
			for (let i = 0; i < maxPlayer; i++)
				if (!!huInfo[i]) {
					if ((huInfo[i].way & HuFa.qiang) != 0)
						isQiangGang = true;
					ret = true;
				}
			if (!ret)
				return false;
			this.OpenMa(isQiangGang);

			for (let i = 0; i < maxPlayer; i++)
				if (!!huInfo[i]) {
					let curHu = huInfo[i];
					if (!!rate.haidi && cards.length == 0) {
						curHu.way |= HuFa.haidi;
						curHu.mutil *= rate.haidi;
					}
					if (!!gameWay.zanpaiquanbao && zanpaiRecord[i] != undefined) {
						curHu.way |= HuFa.quanbao;
						QuanBaoRecord[i] = zanpaiRecord[i];
					}
					if (curHu.way & HuFa.chihu) {
						if (!!gameWay.magendi)
							scoreCount.FromOne(i, currentIdx, curHu.mutil * (curHu.zhong.length + 1));
						else scoreCount.FromOne(i, currentIdx, curHu.mutil + curHu.zhong.length * 2);
					}
					else if (curHu.way & HuFa.quanbao) {
						if (!!gameWay.magendi)
							scoreCount.FromOne(i, QuanBaoRecord[i], curHu.mutil * 3 * (curHu.zhong.length + 1));
						else scoreCount.FromOne(i, QuanBaoRecord[i], curHu.mutil * 3 + curHu.zhong.length * 6);
					}
					else {

						if (!!gameWay.magendi)
							scoreCount.FromAll(i, curHu.mutil * (curHu.zhong.length + 1));
						else scoreCount.FromAll(i, curHu.mutil + curHu.zhong.length * 2);
					}

					scoreCount.CountHu(i, curHu.guiIdx.length == 0, curHu.zhong.length);
				}
			for (let i = 0; i < maxPlayer; i++) {
				if (!!huInfo[(host + i) % maxPlayer]) {
					lastHost = (host + i) % maxPlayer;
					continue;
				}
			}
			let allPlayersCards = [];

			for (let i = maxPlayer - 1; 0 <= i; i--) {
				allPlayersCards[i] = players[i].card;
			}
			let result = {
				ma: maKeeper,
				score: scoreCount.GetRoundCounter(),
				hu: huInfo,
				cards: allPlayersCards,
				zan: zanpaiRecord
			};

			if (room.level >= room.maxLevel) {
				result.final = this.GetFinal();
			}
			sender.SendGameResult(result);
			if (room.level >= room.maxLevel) {
				sender.SenderToSave();
			}

			room.GameEnd();
			return true;
		},
		CheckPengOrDianGang: function () {
			//没牌不许砰 杠
			if (cards.length == 0)
				return;
			let last = lastPlay;
			////console.log("CheckPengOrDianGang");
			for (let i = 0; i < maxPlayer; i++) {
				if (currentIdx == i)
					continue;
				let count = 0;
				let cardArr = players[i].card;
				for (let j = 0; j < cardArr.length; j++) {
					if (cardArr[j] == last)
						count++;
				}
				////console.log("peng", i, players[i], count, last);
				if (count == 2) {
					//牌剩余少于4 不允许碰
					if (cards.length < 4)
						return;
					//锁住连碰的情况
					if (PengLock[i]) {
						let curIdx = PengLock[i].indexOf(last);
						if (curIdx >= 0) {
							return;
						}
					}
					myOperation.AddOperation(i, OperationResult.Peng);
					return;
				}
				else if (count == 3) {
					myOperation.AddOperation(i, OperationResult.DianGang);
					myOperation.AddOperation(i, OperationResult.Peng);
					return;
				}
			}

		},
		CheckQiangGang: function (idx, val) {
			//console.log(gameWay.qianggang);
			if (!gameWay.qianggang)
				return;
			for (let i = 0; i < maxPlayer; i++) {
				if (idx == i)
					continue;

				let tmpCards = [];
				let cur = players[i];
				let curCards = cur.card;
				for (let j = 0; j < curCards.length; j++) {
					tmpCards[j] = curCards[j];
				}
				tmpCards.push(val);
				let ret = WinnerChecker.CheckWin(cur.heap, tmpCards, rate, gui, "qiang");
				//console.log("CheckQiangGang", rate, cur.heap, tmpCards,  gui, ret);
				huInfo[i] = ret;
				if (!!ret) {
					if (gameWay.qianggangquanbao) {
						ret.way |= HuFa.quanbao;
						QuanBaoRecord[i] = idx;
					}
					myOperation.AddOperation(i, OperationResult.Hu);
				}
			}
		},
		CheckGangorAnGang: function (val) {
			//没牌不许砰 杠
			if (cards.length == 0)
				return;
			let curPlayer = players[currentIdx];
			let heapArr = curPlayer.heap;
			let cardArr = curPlayer.card;
			//console.log("CheckGangorAnGang", heapArr, val);
			for (let i = 0; i < heapArr.length; i++) {
				//console.log("CheckGangorAnGang", heapArr[i].v, val, heapArr[i].v == val);
				if (heapArr[i].v == val) {
					//console.log("CheckGangorAnGang pass", heapArr[i], val);
					myOperation.AddOperation(currentIdx, OperationResult.MingGang);
					return val;
				}
			}


			let hash = {};
			for (let i = 0; i < cardArr.length; i++) {
				if (!hash[cardArr[i]])
					hash[cardArr[i]] = 0;
				hash[cardArr[i]]++;
			}
			////console.log("an gang",hash);
			for (let src in hash)
				if (hash[src] == 4) {
					////console.log("an gang");
					myOperation.AddOperation(currentIdx, OperationResult.AnGang);
					return src;
				}
			return -1;
		},
		CheckWin: function (idx) {
			let cur = players[idx];

			let ret = WinnerChecker.CheckWin(cur.heap, cur.card, rate, gui);

			huInfo[idx] = ret;

			if (!!ret) {
				myOperation.AddOperation(idx, OperationResult.Hu);
			}
			return ret;
		},
		CheckAllChiHu: function (idx, val) {
			let ret = false;
			for (let i = 0; i < maxPlayer; i++) {
				if (idx == i)
					continue;

				let tmpCards = [];
				let cur = players[i];
				let curCards = cur.card;
				for (let j = 0; j < curCards.length; j++) {
					tmpCards[j] = curCards[j];
				}
				tmpCards.push(val);
				let winResult = WinnerChecker.CheckWin(cur.heap, tmpCards, rate, gui, "chihu");
				if (!!winResult) {
					let passHufa = HuFa.shisan | HuFa.quanyao | HuFa.quanfeng;
					if (!(winResult.way & passHufa))
						continue;

					huInfo[i] = winResult;
					//console.log("CheckAllChiHu", tmpCards);
					myOperation.AddOperation(i, OperationResult.Hu);
					ret = true;
				}
			}
			return ret;

		},
		CheckAnGangQiangGang: function (idx, val) {
			let ret = false;
			for (let i = 0; i < maxPlayer; i++) {
				if (idx == i)
					continue;

				let tmpCards = [];
				let cur = players[i];
				let curCards = cur.card;
				for (let j = 0; j < curCards.length; j++) {
					tmpCards[j] = curCards[j];
				}
				tmpCards.push(val);
				let winResult = WinnerChecker.CheckWin(cur.heap, tmpCards, rate, gui, "qiang");
				if (!!winResult) {
					let passHufa = HuFa.shisan | HuFa.quanyao | HuFa.quanfeng;
					if (!(winResult.way & passHufa))
						continue;

					huInfo[i] = winResult;
					if (gameWay.qianggangquanbao) {
						winResult.way |= HuFa.quanbao;
						QuanBaoRecord[i] = idx;
					}
					//console.log("CheckAllChiHu", tmpCards);
					myOperation.AddOperation(i, OperationResult.Hu);
					ret = true;
				}
			}
			return ret;

		},
		GetFinal: function () {
			let final = scoreCount.GetFinalCount();
			//console.log("GetFinal",final);
			return final;
		},
		test: function () {

		}
	};
}


module.exports = GameLogic;
