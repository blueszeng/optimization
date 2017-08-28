
var HuFa = require("./LogicConst").HuFa;


var WinExporter = function () {
	var winCount = {
		mutil: 0,
		way: 0,
		cards: [],
		guiIdx: []
	};

	var myRate;
	var gui;
	return {
		SetRate: function (rate, guinput, basehu) {
			myRate = rate;
			winCount = {
				mutil: 1,
				way: 0,
				cards: [],
				guiIdx: []
			};
			gui = guinput;
			this.basehu = basehu;
		},
		AddHuType: function (src) {

			if (!!this.basehu && src == "zimo") {
				src = this.basehu;
			}
			//console.log(src);
			winCount.way |= HuFa[src];
			winCount.mutil *= myRate[src];
		},
		SetCards: function (cards, guiArr) {
			var arr = [], j = guiArr.length - 1;
			var i = cards.length - 1;
			var tmp = cards[i];
			var guiIdx = [];
			if (myRate.wuguijiabei && guiArr.length == 0)
				this.AddHuType("wuguijiabei");
			if (cards[i] == gui) {
				tmp = guiArr.pop();
				j--;
				guiIdx.push(i);
			}
			for (i--; 0 <= i; i--) {
				if (cards[i] == gui)
					arr[i] = guiArr[j--];
				else
					arr[i] = cards[i];
			}
			arr.sort(function (a, b) { return a - b; });
			arr.push(tmp);
			j = 0;
			for (var i = 0; i < arr.length && j < guiArr.length; i++) {
				if (guiArr[j] == arr[i]) {
					j++;
					guiIdx.push(i);
				}
			}
			winCount.cards = arr;
			winCount.guiIdx = guiIdx;
		},
		SetCardsWithoutSort: function (cards) {
			winCount.cards = cards;
			var guiIdx = [];
			for (var i = 0; i < cards.length; i++) {
				if (cards[i] == gui)
					guiIdx.push(i);
			}
			winCount.guiIdx = guiIdx;
		},
		GetData: function () {
			return winCount;
		}
	};
}

var globeExporter = new WinExporter();
var WinnnerChecker = {
	hash: {},
	clearHash: function () {
		var hash = this.hash;
		for (var i = 0; i < 34; i++) {
			hash[i] = 0;
		}
	},
	CheckWin: function (heapArr, cardArr, rate, gui, basehu) {
		globeExporter.SetRate(rate, gui, basehu);
		////console.log("CheckWin", cardArr);
		this.clearHash();
		var hash = this.hash;
		var count = 0;
		var guiArr = [];
		var hasType = {};

		for (var i = 0; i < cardArr.length; i++) {
			var cur = cardArr[i];
			hash[cur] = hash[cur] || 0;
			hash[cur]++;
			count++;
			if (cur != gui)
				hasType[Math.floor(cur / 9)] = true;
		}
		//console.log(hasType);
		var guiCount = hash[gui] || 0;
		if (!!hash[gui])
			hash[gui] = 0;


		//四鬼直接获胜
		if (!!rate.siguihupai && guiCount === 4) {
			globeExporter.AddHuType("zimo");
			globeExporter.AddHuType("siguihupai");
			globeExporter.SetCardsWithoutSort(cardArr);
			return globeExporter.GetData();
		}

		// 十三幺判定 
		if (!!rate.shisan && this.CheckShisan(hash, count, guiCount, guiArr)) {
			globeExporter.AddHuType("zimo");
			globeExporter.AddHuType("shisan");
			globeExporter.SetCards(cardArr, guiArr);
			return globeExporter.GetData();
		}

		var pass = false;
		var hasPair = false;
		var threeConnect = 0;
		var used = {};
		var totalGui = guiCount;
		var onlyYaojiu = true;
		for (var i = 0; i < heapArr.length; i++) {
			if (heapArr[i].v < 27 && (heapArr[i].v % 9 != 0 && heapArr[i].v % 9 != 8))
				onlyYaojiu = false;
			// 	if(heapArr[i].t == 0)
			// 		used[heapArr[i].v] = 3;
			// 	else used[heapArr[i].v] = 4;
			hasType[Math.floor(heapArr[i].v / 9)] = true;
		}

		//console.log(hasType);
		function canUseGui(val, cnt) {
			if (guiCount < cnt)
				return false;

			return true;
		}

		function AddUsed(val, cnt) {
			hash[val] -= cnt;
			// used[val] = used[val]|| 0;
			// used[val] += cnt;
		}

		function FindAns() {
			////console.log(hash);
			////console.log(hash);
			for (var i in hash)
				if (!!hash[i]) {
					////console.log(i + " : " + guiCount);

					i = Number(i);
					if (hash[i] >= 3) {
						AddUsed(i, 3);
						if (FindAns())
							return true;

						AddUsed(i, -3);
					}
					if (!hasPair && hash[i] >= 2) {
						hasPair = true;
						AddUsed(i, 2);
						if (FindAns())
							return true;
						AddUsed(i, -2);
						hasPair = false;
					}
					if (i < 7 || (8 < i && i < 16) || (17 < i && i < 25)) {
						if (!!hash[i + 1] && !!hash[i + 2]) {
							for (var j = 0; j < 3; j++)
								AddUsed(i + j, 1);
							threeConnect++;
							if (FindAns())
								return true;

							threeConnect--;
							for (var j = 0; j < 3; j++)
								AddUsed(i + j, -1);
						}
					}
					////console.log(i + " in " +guiCount, guiArr);
					if (guiCount == 0)
						return false;

					if (canUseGui(i, 2)) {

						AddUsed(i, 1);
						guiArr[totalGui - guiCount] = i;
						guiArr[totalGui - guiCount + 1] = i;
						guiCount -= 2;
						if (FindAns())
							return true;
						guiCount += 2;
						AddUsed(i, -1);
					}

					if (canUseGui(i, 1)) {
						if (!hasPair) {
							hasPair = true;
							guiArr[totalGui - guiCount] = i;
							AddUsed(i, 1);
							guiCount--;
							if (FindAns())
								return true;

							guiCount++;
							AddUsed(i, -1);
							hasPair = false;
						}
						if (hash[i] == 2) {
							////console.log(i);
							AddUsed(i, 2);
							guiArr[totalGui - guiCount] = i;
							guiCount--;
							if (FindAns())
								return true;

							guiCount++;
							AddUsed(i, -2);
						}
					}
					////console.log("ere");
					if (i < 27) {
						var cur = i % 9;

						for (var j = 0; -3 < j; j--) {
							if (cur + j < 0 || cur + j + 1 > 8 || cur + j + 2 > 8)
								continue;

							var start = i + j;
							var cnt = 0;
							for (var k = 0; k < 3; k++) {
								if (hash[start + k])
									cnt++;
								else if (!canUseGui(start + k, 1)) {
									cnt = -1;
									break;
								}
							}

							if (cnt <= 0)
								continue;

							if (cnt == 2 && guiCount >= 1) {
								var tmpGui = {};
								for (var k = 0; k < 3; k++) {
									if (!hash[start + k]) {
										tmpGui[k] = 1;
										guiArr[totalGui - guiCount] = start + k;
										guiCount--;
									} else {
										AddUsed(start + k, 1);
									}
								}
								threeConnect++;
								if (FindAns())
									return true;
								threeConnect--;
								for (var k = 2; 0 <= k; k--) {
									if (tmpGui[k]) {
										guiCount++;
									} else {
										AddUsed(start + k, -1);
									}
								}
							}

							if (cnt == 1)
								break;

						}
					}

					return false;
				}


			if (guiCount > 0) {
				for (var i = 0; i < 4; i++)
					if (hasType[i]) {
						while (guiCount > 0) {
							guiArr[totalGui - guiCount] = i * 9;
							guiCount--;
						}
					}
			}

			return true;
		}

		var ret = FindAns();
		if (ret) {
			var tcnt = 0, lastt = 0;
			for (var i = 0; i < 4; i++) {
				if (hasType[i]) {
					tcnt++;
					lastt = i;
				}
			}
			//console.log(tcnt + "   " + threeConnect);
			//只有一种色
			if (!!rate.qingyise && tcnt == 1) {
				//全风
				if (!!rate.quanfeng && lastt == 3) {
					globeExporter.AddHuType("zimo");
					globeExporter.AddHuType("quanfeng");
					globeExporter.SetCards(cardArr, guiArr);
					return globeExporter.GetData();

				}
				//清对
				if (!!rate.qingdui && threeConnect == 0) {
					globeExporter.AddHuType("zimo");
					globeExporter.AddHuType("qingdui");
					globeExporter.SetCards(cardArr, guiArr);
					return globeExporter.GetData();

				}

				globeExporter.AddHuType("zimo");
				globeExporter.AddHuType("qingyise");
				globeExporter.SetCards(cardArr, guiArr);
				return globeExporter.GetData();
			}

			if (!!rate.yaojiu && threeConnect == 0 && onlyYaojiu) {
				var pass = true;
				for (var i = 0; i < cardArr.length && pass; i++) {
					if (cardArr[i] != gui && (cardArr[i] < 27 && cardArr[i] % 9 != 0 && cardArr[i] % 9 != 8))
						pass = false;
				}
				if (pass) {
					if (!!rate.quanyao && lastt != 3) {
						globeExporter.AddHuType("zimo");
						globeExporter.AddHuType("quanyao");
						globeExporter.SetCards(cardArr, guiArr);
						return globeExporter.GetData();
					}
					globeExporter.AddHuType("zimo");
					globeExporter.AddHuType("yaojiu");
					globeExporter.SetCards(cardArr, guiArr);
					return globeExporter.GetData();
				}
			}
			//混一色
			if (!!rate.hunyise && hasType[3] && tcnt == 2) {
				//混对
				if (!!rate.hundui && threeConnect == 0) {
					globeExporter.AddHuType("zimo");
					globeExporter.AddHuType("hundui");
					globeExporter.SetCards(cardArr, guiArr);
					return globeExporter.GetData();

				}

				globeExporter.AddHuType("zimo");
				globeExporter.AddHuType("hunyise");
				globeExporter.SetCards(cardArr, guiArr);
				return globeExporter.GetData();
			}
			//对对胡
			if (!!rate.duiduihu && threeConnect == 0) {
				globeExporter.AddHuType("zimo");
				globeExporter.AddHuType("duiduihu");
				globeExporter.SetCards(cardArr, guiArr);
				return globeExporter.GetData();
			}
			//自摸
			globeExporter.AddHuType("zimo");
			globeExporter.SetCards(cardArr, guiArr);
			return globeExporter.GetData();
		}
		//qidui
		if (!!rate.qidui && this.CheckQiDui(hash, count, guiCount, guiArr, gui)) {
			globeExporter.AddHuType("zimo");
			globeExporter.AddHuType("qidui");
			globeExporter.SetCards(cardArr, guiArr);
			return globeExporter.GetData();
		}
		return null;
	},
	//十三幺判定
	CheckShisan: function (hash, count, guiCount, guiArr) {
		if (count < 13)
			return false;

		var arr = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
		var pair = false;
		var curGuiCount = guiCount;
		var j = 0;
		for (var i = 0; i < arr.length; i++) {
			var cur = arr[i];
			if (!hash[cur]) {
				if (curGuiCount == 0)
					return false;
				if (curGuiCount > 0) {

					curGuiCount--;
					guiArr[j++] = cur;
					continue;
				}
			}
			if (hash[cur] > 2)
				return false;
			if (hash[cur] == 2) {
				if (pair)
					return false;
				pair = true;
			}
		}
		if (!pair && curGuiCount == 0)
			return false;
		if (curGuiCount == 1) {
			guiArr[j++] = 33;
		}
		return true;
	},
	//七对判定
	CheckQiDui: function (hash, count, guiCount, guiArr, gui) {
		if (count < 13)
			return false;
		var j = 0;
		var curGuiCount = guiCount;
		var j = 0;
		for (var src in hash) {
			if (hash[src] % 2 == 1) {
				if (curGuiCount == 0)
					return false;

				guiArr[j++] = src;
				--curGuiCount;
			}
		}
		if (curGuiCount) {
			while (curGuiCount--) {
				guiArr[j++] = gui;
			}
		}
		return true;
	}


};


module.exports = WinnnerChecker;