
var Code = require("../../../code/ErrorCode");
var RoomManager = require("../../../domain/Manager/RoomManager");

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
// Handler.prototype.send = function(msg, session, next) {
// 	var rid = session.get('rid');
// 	var uid = session.uid;
// 	var channelService = this.app.get('channelService');

// 	var param = {
// 		msg: msg.msg,
// 		from: uid,
// 	};
// 	var channel = channelService.getChannel(rid, false);
// 	if(!rid || !channel)
// 	{
// 		next(null, {
// 			code: Code.NO_SUCH_ROOM
// 		});
// 		return;
// 	}
// 	channel.pushMessage('OnChat', param);
	

// 	next(null, {
// 		code: Code.OK
// 	});
// };


// Handler.prototype.sendBytes = function(msg, session, next) {
// 	var rid = session.get('rid');
// 	var uid = session.uid;
// 	var channelService = this.app.get('channelService');
// 	console.log(msg.msg);
// 	var param = {
// 		msg: msg.msg,
// 		from: uid,
// 	};
// 	var channel = channelService.getChannel(rid, false);
// 	if(!rid || !channel)
// 	{
// 		next(null, {
// 			code: Code.NO_SUCH_ROOM
// 		});
// 		return;
// 	}
// 	channel.pushMessage('OnChatBytes', param);
	

// 	next(null, {
// 		code: Code.OK
// 	});
// };