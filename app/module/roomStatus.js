/*!
 * Pomelo -- consoleModule sceneInfo
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
let logger = require('pomelo-logger').getLogger(__filename);
let utils = require('../util/utils');

module.exports = function(opts) {
	return new Module(opts);
};

module.exports.moduleId = 'roomStatus';

let Module = function(opts) {
	opts = opts || {};
	this.type = opts.type || 'pull';
	this.interval = opts.interval || 5;
};

Module.prototype.monitorHandler = function(agent, msg, cb) {
	//collect data
	let serverId = agent.id;
	let RoomManager = require('../domain/Manager/RoomManager');
	let data = RoomManager.GetAllRoomInfo();
	//console.log(data);
	agent.notify(module.exports.moduleId,data);
};

Module.prototype.masterHandler = function(agent, msg, cb) {
	if(!msg) {
		// pull interval callback
		let list = agent.typeMap['game'];
		if(!list || list.length === 0) {
			return;
		}
		agent.notifyByType('game', module.exports.moduleId);
		return;
	}
	//console.log(msg);
	let data = agent.get(module.exports.moduleId);
	if(!data) {
		data = {};
		agent.set(module.exports.moduleId, data);
	}
	data[msg.serverId] = msg;
};

Module.prototype.clientHandler = function(agent, msg, cb) {
	utils.invokeCallback(cb, null, agent.get(module.exports.moduleId));
};
