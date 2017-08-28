
let pomelo = require('pomelo');

/**
 * Init app for client.
 */
let app = pomelo.createApp();
app.set('name', 'malatang');

let serverSettings = require("./config/serverSettings.json");

let routeUtil = require('./app/util/routeUtil');
app.configure('production|development', function () {
	app.serverSettings = serverSettings;
	app.route('game', routeUtil.game);
	app.before(pomelo.filters.toobusy());
	app.enable('systemMonitor');
	//   //let sceneInfo = require('./app/modules/sceneInfo');
	// let onlineUser = require('./app/module/onlineUser');
	// app.registerAdmin(onlineUser, {app: app});
	app.loadConfig('redisConfig', app.getBase() + '/config/redis.json');
	
	let roomStatus = require('./app/module/roomStatus');
	app.registerAdmin(roomStatus, { app: app });
	//}
	//let admin = require("pomelo-admin");
	// let masterConsole = admin.createMasterConsole({  
	//     port: 8710  
	// });  
	// masterConsole.register("moduleId", {interval:3000, type:"push"});  
	// let timeReport = require('./app/util/timeReport');
	//app.registerAdmin(admin, {app: app});
	//
	app.set("errorHandler", function (err, msg, resp, session, next) {
		console.error(err, msg, resp);
		next({ code: 500, msg: err });
	});
	// proxy configures
	app.set('proxyConfig', {
		bufferMsg: false,
		//interval: 30,
		//lazyConnection: true,

		// failMode : 'failsafe',
		// retryTimes:　3, //重试次数
		// retryConnectTime:　5 * 1000, //重连间隔时间
		// timeoutValue: 60000
		// enableRpcLog: true
	});

	// remote configures
	app.set('remoteConfig', {
		bufferMsg: false,
		//interval: 30
	});
});


let dbSettings = require("./config/DBconfig.json");

app.configure('production|development', 'master', function () {
	let db = require("./app/dao/DBConnector");
	db.Init(dbSettings);

	let RemoveRecord = require('./app/components/RemoveRecord');
	if (serverSettings.RemoveRecode)
		app.load(RemoveRecord, { interval: 5000 });
});

//let admin = require("pomelo-admin");
// app configuration
app.configure('production|development', 'platform', function () {
	app.set('connectorConfig',
		{
			connector: pomelo.connectors.hybridconnector,
			//useProtobuf: true,
			handshake: function (msg, cb) {
				//console.log(msg);
				let user = msg.user;
				if (!user || !user.key || user.key != serverSettings.PlatformHandShake) {
					cb(404, {});
					return;
				}
				cb(null, {});
			}
		});
	let db = require("./app/dao/DBConnector");
	db.Init(dbSettings, 500);

	let redisCache = require('./app/dao/redis/redis').Init(app);
	app.set('redisCache', redisCache);

	let WebManager = require("./app/domain/Manager/WebManager");
	app.web = WebManager.Init(app);
});

app.configure('production|development', 'connector', function () {
	let db = require("./app/dao/DBConnector");
	db.Init(dbSettings, 100);

	let redisCache = require('./app/dao/redis/redis').Init(app);
	app.set('redisCache', redisCache);

	app.set('connectorConfig',
		{
			connector: pomelo.connectors.hybridconnector,
			heartbeat: 30,
			useDict: true,
			useProtobuf: true,
			handshake: function (msg, cb) {
				//console.log(msg);
				let user = msg.user;
				if (!user || !user.key || user.key != serverSettings.PlatformHandShake) {
					cb(404, {});
					return;
				}
				cb(null, {});
			}
		});

	// setTimeout(()=>{
	// 	console.log(app.getCurServer ());
	// }, 2000);
	//app.route('connector', routeUtil.connector);
	let PlayerManager = require("./app/domain/Manager/PlayerManager");
	app.PlayerManager = PlayerManager;
	PlayerManager.Init(app);
	let RecordManager = require("./app/domain/Manager/RecordManager");
	app.RecordManager = RecordManager;
	RecordManager.Init(app, {});
	let MessageManager = require("./app/domain/Manager/MessageManager");
	app.MessageManager = MessageManager;

	let playerFilter = require('./app/servers/connector/filter/playerFilter');
	app.before(playerFilter());
});
// app configuration game
app.configure('production|development', 'game', function () {
	app.filter(pomelo.filters.serial());
	let db = require("./app/dao/DBConnector");
	db.Init(dbSettings);

	let redisCache = require('./app/dao/redis/redis').Init(app);
	app.set('redisCache', redisCache);

	let game = require("./app/domain/Logic/GameLogic");
	let RoomManager = require("./app/domain/Manager/RoomManager");
	// app.RoomManager = RoomManager;
	// 	setTimeout(()=>{
	// 	console.log(app.getCurServer ());
	// }, 2000);

	let curSever = app.getServersFromConfig()[app.getServerId()];
	let base = Math.floor(899999 / curSever.max);
	RoomManager.Init(app, { maxRoom: base, startID: 100000 + curSever.idx * base });

	let gameFilter = require('./app/servers/game/filter/gameFilter');
	app.before(gameFilter());
});

// start app
app.start();

process.on('uncaughtException', function (err) {
	console.error(' Caught exception: ' + err.stack);
});
