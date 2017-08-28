
let cacheManager = require("../../util/cacheManager");
let RecordModel = require("../../dao/schema/RecordModel");
let UserRecordModel = require("../../dao/schema/UserRecordModel");
let PlayerManager = require("./PlayerManager");
let logger = require('pomelo-logger').getLogger(__filename);
let utils = require('../../util/utils');
const ADAY = 24 * 3600 * 1000;
class RecordManager {
	constructor() {
		this.count = 0;
		this.users = {};
		this.myRecordCached = null;
		this.userRecordCached = null;
	}
	Init(app, opt) {
		this.app = app;
		this.myRecordCached = new cacheManager(app);
		this.userRecordCached = new cacheManager(app);
	}
	GetRecordByID(id) {
		return new Promise((resolve, reject) => {
			let item = this.myRecordCached.GetItem(id);
			if (item != null) {
				return resolve(item.data);
			}
			RecordModel.findOne({ id: id })
				.then((ret) => {
					if (!!ret) {
						this.myRecordCached.SetItem(id, { data: ret });
						return resolve(ret);
					}
					resolve(null);
				}).catch((err) => {
					return reject(err)
				})
		});

	}
	RemoveRecordOverTime(ret) {
		return new Promise((resolve, reject) => {
			if (!this.app.serverSettings.RemoveRecode) {
				return resolve(ret);
			}
			let records = ret.records;
			let changed = false;
			let adayago = (Date.now()) - ADAY;
			for (let i = records.length - 1; 0 <= i; i--) {
				if (records[i].records.length == 0) {
					records.splice(i, 1);
					changed = true;
					continue;
				}
				let last = records[i].records[records[i].records.length - 1];
				let time = last.edate || last.date;

				if (time > adayago)
					continue;
				//console.log("remove",time, adayago,records[i]);
				records.splice(i, 1);
				changed = true;
			}
			// console.log(ret);
			if (changed) {
				ret.save().then((ret) => {
					return resolve(ret)
				}).catch((err) => {
					return reject(err)
				});
				return;
			}
			resolve(ret)
		});
	}
	GetUserRecordByUid(id) {
		return new Promise((resolve, reject) => {
			let item = this.myRecordCached.GetItem(id);
			if (item != null) {
				reject(item.data)
				return;
			}
			let self = this;
			UserRecordModel.findOne({ uid: id + "" })
				.then((ret) => {
					//console.log(id, ret);
					if (!!ret) {
						this.userRecordCached.SetItem(id, { data: ret })
						return self.RemoveRecordOverTime(ret);
					}
					return self.CreateRecordByUid(id);
				}).then((ret) => {
					if (!!ret) {
						return resolve(ret);
					}
					return reject(null)
				}).catch((err) => {
					return reject(err);
				});
		});
	}
	CreateRecordByUid(id) {
		return new Promise((resolve, reject) => {
			let entity = PlayerManager.GetPlayer(id);
			let obj = { uid: id, _user: entity.userModel._id, records: [] };
			let userRecord = new UserRecordModel(obj);
			userRecord.save()
				.then((ret) => {
					userRecordCached.SetItem(id, { data: ret })
					return resolve(ret)
				}).catch((err) => {
					return reject(err);
				});
		});
	}
}

module.exports = new RecordManager();