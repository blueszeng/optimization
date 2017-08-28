let logger = require('pomelo-logger').getLogger(__filename);
let mongoose = require('mongoose');
let DBConfig = require('../../config/DBConfig.json');
let configModel = require("./schema/configModel");
let playerModel = require("./schema/playerModel");
let utils = require('../util/utils');
const GLOBE_KEY = "_globe_id";

class IDManager {
	constructor() {
		this.model = null;
		this.inited = false;
	}

	init(opt) {
		opts = opts || {};
		self = this;
		configModel.findOne({ id: GLOBE_KEY })
			.then((res) => {
				if (!!res) {
					self.model = model;
					self.inited = true;
					return;
				}
				let model = new configModel({ id: GLOBE_KEY });
				model.startid = opts.startid || 10000;
				model.currentid = model.startid;
				return model.save().then((res) => {
					self.model = model;
					self.inited = true;
				}).catch((err) => {
					logger.error("id manager Create failed!", err);
				});
			}).catch((err) => {
				logger.error("id manager init failed!", err);
			});
	}

	GetPlayerID() {
		return new Promise((resolve, reject) => {
			if (!this.inited) {
				logger.error("IDModel still not init");
				reject("not inited");
				return;
			}
			let idModel = this.model;
			function CheckIDNotBeUsed() {
				playerModel.findOne({ id: idModel.currentid })
					.then((ret) => {
						if (!!ret) {
							logger.error("same player ID");
							idModel.currentid++;
							return CheckIDNotBeUsed();
						}
						resolve(idModel.currentid);
						idModel.currentid++;
						idModel.save();
					}).catch((err) => {
						logger.error("check player ID failed");
						reject("find player failed");
					})
			}
			CheckIDNotBeUsed();
		});
	}
}

module.exports = new IDManager();