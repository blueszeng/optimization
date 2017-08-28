
var logger = require('pomelo-logger').getLogger(__filename);

class PlayerEntity {
	constructor(userModel, playerModel, playerManager) {
		this.playerModel = playerModel;
		this.userModel = userModel;
		this.playerManager = playerManager;
	}

	SetUser(userModel) {
		this.userModel = userModel;
	}

	IsEnoughCard(num) {
		// var hr = new Date().getHours();
		// if(17<=hr && hr < 23)
		// {
		// 	return true;
		// }
		if (this.playerModel.cardNum >= num)
			return true;

		return false;
	}

	CostCard(num) {
		//var hr = new Date().getHours();
		// if(17<=hr && hr < 23)
		// {
		// 	return;
		// }
		this.playerModel.cardNum -= num;
		if (this.playerModel.cardNum < 0)
			this.playerModel.cardNum = 0;
		this.playerModel.markModified("cardNum");
		this.playerModel.save(function (err) {
			if (!!err) {
				logger.error("cardNum", err, this.playerModel);
			}
		});

		// var self = this;
		// function updateSave()
		// {
		// 	self.playerModel.cardNum +=  num;
		// 	self.playerModel.markModified("cardNum");
		// 	console.log(self.playerModel.cardNum);
		// 	self.playerModel.save(function(err){
		// 		if(!!err){
		// 			logger.error("cardNum", err, this.playerModel);
		// 		}
		// 	});
		// 	setTimeout(updateSave, 100);
		// }
		// setTimeout(updateSave, 100);
	}

	AddCard(num) {
		return new Promise((resolve, reject) => {
			var after = this.playerModel.cardNum += num;
			this.playerModel.markModified("cardNum");
			this.playerModel.save()
				.then((ret) => {
					return resolve({ code: 200, after: after });
				}).catch((ret) => {
					logger.error("cardNum", err, this.playerModel);
					return reject({ code: 1 });
				});
		});
	}

	SetIP(ip) {
		var player = this.playerModel;
		var str = "" + ip;

		var arr = str.match(/((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}/g);
		if (!arr || arr.length == 0)
			str = "";
		else str = arr[0];
		player.ip = str;
		//console.log(player.ip, ip);
		player.markModified("ip");
		this.playerModel.save(function (err) {

		});
	}

	GetUserInfo(ToSelf) {
		var user = this.userModel;
		var player = this.playerModel;
		var ret = {
			uid: user.id,
			name: user.name,
			sex: user.sex,
			head: user.head,
			ip: player.ip
		};


		if (ToSelf) {

			ret.room = this.playerManager.GetPlayerRoom(user.id) || 0
			ret.cardNum = player.cardNum;
		}
		//console.log(ret);
		return ret;
	}

	GetUpdateUserInfo() {
		return {
			room: this.playerManager.GetPlayerRoom(this.userModel.id) || 0,
			cardNum: this.playerModel.cardNum
		}
	}
}


module.exports = PlayerEntity;