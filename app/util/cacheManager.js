
var utils = require("./utils");
/*
基于时间缓存小组件
*/
class CachedManager {
	constructor(app, opt = {}) {
		this.app = app;
		this.interval = opt.interval || 60000;
		this.lastTime = opt.last || 1800000;
		this.map = {};
	}

	ResetItemTime(id) {
		var item = this.map[id];
		if (!!item) {
			item.__time = Date.now();
			return true;
		}
		return false;
	}

	GetItem(id) {
		var item = this.map[id];
		if (!!item) {
			this.ResetItemTime(id);
			return item;
		}
		return null;
	}

	SetItem(id, item) {
		this.map[id] = item;
		this.ResetItemTime(id);
	}

	start(cb) {
		var self = this;
		this.timerID = setInterval(function () {
			self.Update();
		}, this.interval);
		process.nextTick(cb);
	}

	afterStart(cb) {
		process.nextTick(cb);
	}

	stop(cb) {
		clearInterval(this.timerID);
		process.nextTick(cb);
	}

	update() {
		var map = this.map;
		var curTime = Date.now();
		curTime -= this.lastTime;
		for (var src in map) {
			if (curTime > map[src].__time) {
				delete map[src];
			}
		}
	}
}

module.exports = CachedManager;