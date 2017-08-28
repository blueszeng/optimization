
var RecordModel = require("../dao/schema/RecordModel");
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function (app, opts) {
  return new removeRecord(app, opts);
};

var DEFAULT_INTERVAL = 3000;

const aday = 24 * 60 * 60 * 1000;
const DELAY_DEFAULT = 5000;
var removeRecord = function (app, opts) {
  this.app = app;
  this.interval = opts.interval || DEFAULT_INTERVAL;
  this.timerId = null;

  this.delay = opts.delay || DELAY_DEFAULT;
};

removeRecord.name = '__removeRecord__';

removeRecord.prototype.start = function (cb) {
  logger.debug('removeRecord Start');
  var self = this;
  setTimeout(function () {
    self.timerId = setInterval(function () {
      self.clearRecord();
    }, self.interval);
  }, this.delay);
  process.nextTick(cb);
}

removeRecord.prototype.afterStart = function (cb) {

  process.nextTick(cb);
}

removeRecord.prototype.stop = function (force, cb) {
  logger.debug('removeRecordstop');
  clearInterval(this.timerId);
  process.nextTick(cb);
}

/**
 * 清除游戏记录，游戏记录只缓存一天
 * @return {[type]}         [description]
 */
removeRecord.prototype.clearRecord = function () {
  var adayAgo = Date.now() - aday;
  RecordModel.remove({ date: { $lt: adayAgo } })
    .catch((err) => {
      logger.error(err, ret);
    });
}