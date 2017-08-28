/*!
 * Pomelo -- consoleModule onlineUser 
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
let logger = require('pomelo-logger').getLogger(__filename);
let utils = require('../util/utils');

module.exports = function(opts) {
	return new Module(opts);
};

module.exports.moduleId = 'onlineUser';

let Module = function(opts) {
	opts = opts || {};
	this.app = opts.app;
	this.type = opts.type || 'pull';
	this.interval = opts.interval || 5;
};

Module.prototype.monitorHandler = function(agent, msg) {
	let connectionService = this.app.components.__connection__;
	if(!connectionService) {
		logger.error('not support connection: %j', agent.id);
		return;
	}
	let ret = connectionService.getStatisticsInfo();
	console.log(ret);
	agent.notify(module.exports.moduleId, ret);
};

Module.prototype.masterHandler = function(agent, msg) {
	if(!msg) {
		// pull interval callback
		let list = agent.typeMap['connector'];
		if(!list || list.length === 0) {
			return;
		}
		agent.notifyByType('connector', module.exports.moduleId);
		return;
	}

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
