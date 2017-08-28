/*
用于缓存用户

*/

class UserManager {
	constructor() {
		this.count = 0;
		this.users = {};
	}
	Init(opt) {

	}
	GetUser(uid) {
		return this.users[uid];
	}
	SetUserRoom(uid, rid) {
		if (this.users[uid] === null) {
			this.count++;
		}
		this.users[uid] = rid;
	}
	IsInRoom(uid) {
		return !!this.users[uid];
	}

}

module.exports = new UserManager();