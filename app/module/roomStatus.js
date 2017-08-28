/*!
 * Pomelo -- consoleModule sceneInfo
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../util/utils');

module.exports = function(opts) {
	return new Module(opts);
};

module.exports.moduleId = 'roomStatus';

var Module = function(opts) {
	opts = opts || {};
	this.type = opts.type || 'pull';
	this.interval = opts.interval || 5;
};

Module.prototype.monitorHandler = function(agent, msg, cb) {
	//collect data
	var serverId = agent.id;
	var RoomManager = require('../domain/Manager/RoomManager');
	var data = RoomManager.GetAllRoomInfo();
	//console.log(data);
	agent.notify(module.exports.moduleId,data);
};

Module.prototype.masterHandler = function(agent, msg, cb) {
	if(!msg) {
		// pull interval callback
		var list = agent.typeMap['game'];
		if(!list || list.length === 0) {
			return;
		}
		agent.notifyByType('game', module.exports.moduleId);
		return;
	}
	//console.log(msg);
	var data = agent.get(module.exports.moduleId);
	if(!data) {
		data = {};
		agent.set(module.exports.moduleId, data);
	}
	data[msg.serverId] = msg;
};

Module.prototype.clientHandler = function(agent, msg, cb) {
	utils.invokeCallback(cb, null, agent.get(module.exports.moduleId));
};
