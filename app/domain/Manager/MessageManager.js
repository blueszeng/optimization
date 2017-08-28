
let feedbackModel = require("../../dao/schema/feedbackModel");
let pomelo = require("pomelo");
let logger = require('pomelo-logger').getLogger(__filename);
let fs = require("fs");
class CreateManager {
	constructor() {
		this.publicMessage = "";
		this.privateMessage = "";
		this.scrollMessage = { level: 1, msg: "欢迎光临！" };
		setInterval(function () {
			let data = fs.readFileSync("./config/message.json", "utf8");

			let up = JSON.parse(data);
			//console.log(up.public);
			if (up.public)
				this.publicMessage = up.public;
			if (up.private)
				this.privateMessage = up.private;
			if (up.scroll)
				this.scrollMessage = up.scroll;

		}, 10000);
	}

	BroadcastMessage() {
		this.app.get('channelService').broadcast("connector", "OnMessage", { level: 1, msg: "123123sadasd" }, null, function (err, ret) {
			console.log("channelService", err, ret);
		});
	}
	PostSingleMessage(session) {
		pomelo.app.components.__connector__.send(null, "OnMessage", this.scrollMessage, [session.id], null, function (err, ret) {
			if (!!err)
				logger.error("PostSingleMessage", err, ret, this.scrollMessage);
		});
	}
	ModifyScrollMessage() {

	}
	GetMessage() {
		return {
			public: this.publicMessage,
			private: this.privateMessage
		}
	}
	PushFeedBack(uid, title, content) {
		let obj = { uid: uid, title: title, content: content, date: Date.now() };
		let newfb = new feedbackModel(obj);
		let before = Date.now();
		newfb.save().catch((err) => {
			logger.error("PushFeedBack", obj, err);
		});
	}
}

module.exports = new CreateManager();