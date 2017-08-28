
var Code = require("../../../code/ErrorCode");
var UserDao = require("../../../dao/UserDao");
var tokenManager = require("../../../util/token");
var config = require("../../../../config/serverSettings.json");
var dispatcher = require("../../../util/dispatcher");
var simpleRequest = require("../../../util/simpleRequest");
var logger = require('pomelo-logger').getLogger(__filename);
module.exports = function (app) {
	return new Handler(app);
};

let Handler = function (app) {
	this.app = app;
};

Handler.prototype.Author = function (msg, session, next) {
	let openid = msg.openid;
	let access_token = msg.access_token;
	//var plat = msg.plat;

	if (!openid || !access_token) {
		next(null, { code: Code.FAIL });
		return;
	}

	//浪费性能
	let connectors = this.app.getServersByType('connector');
	//console.log(connectors);
	// if(!connectors || connectors.length === 0) {
	// 	next(null, {code: Code.FA_NO_SERVER_AVAILABLE});
	// 	return;
	// }
	function response(model) {
		let uid = model.id;
		if (model.name != wcRet.nickname)
			model.set("name", wcRet.nickname);
		if (model.sex != wcRet.sex)
			model.set("sex", wcRet.sex);
		if (model.head != wcRet.headimgurl)
			model.set("head", wcRet.headimgurl);
		let t = Date.now();
		model.set("lastLogin", t);
		model.save()
			.then((ret) => {
				let res = dispatcher.dispatch(uid, connectors);
				let token = tokenManager.create(res.id, uid, t, config.TokenPassword);
				next(null, { code: Code.OK, uid: uid, token: token, host: res.output, port: res.clientPort });
			}).catch((err) => {
				logger.error("save info:", err);
				next(null, { code: Code.SERVER_IS_BUSY });
			});
	}

	simpleRequest.HttpsReuest("https://api.weixin.qq.com/sns/userinfo?",
		{
			openid: openid,
			access_token: access_token
		}).then((wcRet) => {
			if (!!wcRet.errcode) {
				logger.warn("Author Failed :", err, openid, access_token);
				next(null, { code: Code.AUTH_FAILED });
				return;
			}
			UserDao.FindUserByOpenid(openid)
				.then((ret) => {
					if (!ret) {
						UserDao.CreateUser(openid)
							.then((ret) => {
								response(ret);
							});
						return;
					}
					if (!ret.enable) {
						next(null, { code: Code.ACCOUNT_DISABLED });
						return;
					}
					response(ret);
				}).catch((err) => {
					logger.Error("Author FindUserByOpenid:", err, openid, access_token);
					next(null, { code: Code.SERVER_IS_BUSY });
					return;
				})
		}).catch((err) => {
			if (!!wcRet.errcode) {
				logger.warn("Author Failed :", err, openid, access_token);
				next(null, { code: Code.AUTH_FAILED });
				return;
			}
		})
};
