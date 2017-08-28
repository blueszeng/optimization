/*
用于缓存用户
*/
var express = require('express');
var web = express();
var logger = require('pomelo-logger').getLogger(__filename);
var dispatcher = require("../../util/dispatcher");
var pomelo = require("pomelo");
var app;

// var server;
class WebManager {
	constructor() {
		this.app = null;
	}
	Init(application) {
		this.app = application;
		let settings = this.app.getCurServer();
		//console.error(JSON.stringify( settings));
		let server = web.listen(settings.webPort, function (err, ret) {
			console.log('Listening on port %d', server.address().port);
		});
		return server;
	}
	Paynotify(req, res) {
		var count = Number(req.query.count);
		var uid = req.query.uid;
		//console.log( req.query);
		if (!count) {
			return res.status(200).end("");
		}
		var connectors = this.app.getServersByType('connector');
		var connector = dispatcher.dispatch(uid, connectors);
		pomelo.app.rpc.connector.userRemote.addCard.toServer(connector.id, uid, count, function (ret) {
			if (ret.code != 200) {
				logger.error("addRecord", err, ret, uid);
			}
			return res.status(200).end(JSON.stringify(ret));
		});
	}
}
let webManager = new WebManager();



web.get("/paynotify", webManager.Paynotify.bind(webManager));


module.exports = webManager;