
let logger = require('pomelo-logger').getLogger(__filename);
let playerModel = require("./schema/playerModel");
let utils = require('../util/utils');

let UserDao = require("./UserDao");

let PlayerManager = require("../domain/Manager/PlayerManager");

class PlayerDao {
	constructor() { }
	FindPlayerByUserID(uid) {
		return new Promise((resolve, reject) => {
			let entity = PlayerManager.GetPlayer(uid)
			if (!!entity) {
				UserDao.FindUserByUserid(uid)
					.then((user) => {
						entity.SetUser(user);
						resolve(entity);
					}).catch((err) => {
						reject(err);
					});
				return;
			}
			let self = this;
			playerModel.findOne({ uid: uid }).populate("_user").exec()
				.then((player) => {
					if (!!player) {
						entity = PlayerManager.CreatePlayer(player._user, player);
						return resolve(entity);
					}
					return self.CreatePlayer(uid);
				}).then((entity) => {
					resolve(entity)
				}).catch((err) => {
					reject(err)
				})
		});
	}

	CreatePlayer(uid) {
		return new Promise((resolve, reject) => {
			UserDao.FindUserByUserid(uid)
				.then((user) => {
					if (!user) {
						return reject("user not find");
					}
					let obj = { uid: uid, _user: user._id, cardNum: 8 };
					let newPlayer = new playerModel(obj);
					return newPlayer.save();
				}).then((player) => {
					let entity = PlayerManager.CreatePlayer(user, player);
					resolve(entity)
				}).catch((err) => {
					reject(err);
				});
		});
	}
}
module.exports = new PlayerDao();