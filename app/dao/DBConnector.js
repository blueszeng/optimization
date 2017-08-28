let logger = require('pomelo-logger').getLogger(__filename);
let mongoose = require('mongoose');
let autoIncrement = require('mongoose-auto-increment');

class CreateDBManage {

	constructor() {
		let db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', function (callback) {
			// yay!
			console.log("db connection sucess!");
		});

		console.log("db connection start!");
	}

	Init(DBConfig, max = 20) { //, {server:{ poolSize: 10 }}
		// let options = { promiseLibrary: global.Promise };
		mongoose.Promise = global.Promise;
		let connection = mongoose.createConnection('mongodb://' + DBConfig.host + '/' + DBConfig.database + "?poolSize=" + max);
		connection.on('error', console.error.bind(console, 'connection error:'));
		connection.once('open', function (callback) {
			// yay!
			console.log("db connection sucess!");
		});
		autoIncrement.initialize(connection);
		mongoose.connection = connection;
	}
}

module.exports = new CreateDBManage();