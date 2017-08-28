
let logger = require('pomelo-logger').getLogger(__filename);
let mongoose = require('mongoose');
let userModel = require("./schema/UserModel");
class userDao {

	constructor() { }

	FindUserByOpenid(openid) {
		return new Promise((resolve, reject) => {
			userModel.findOne({ openid: openid })
				.then((ret) => {
					if (!!ret) {
						return resolve(ret);
					}
					return reject(null)
				}).catch((err) => {
					return reject(err);
				});
		});
	}

	FindUserByUserid(id) {
		return new Promise((resolve, reject) => {
			userModel.findOne({ id: id })
				.then((ret) => {
					if (!!ret) {
						return resolve(ret);
					}
					return reject(null)
				}).catch((err) => {
					return reject(err);
				});
		});
	}

	CreateUser(openid) {
		const obj = { openid: openid, cardNum: 8 };
		let newuser = new userModel(obj);
		let before = Date.now();
		return new Promise((resolve, reject) => {
			newuser.save()
				.then((data) => {
					logger.debug("CreateUser", Date.now() - before);
					return resolve(data);
				}).catch((err) => {
					logger.error("CreateUser", err);
					return reject(err);
				})
		});
	}
}

module.exports = new userDao();