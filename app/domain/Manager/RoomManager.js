
let Room = require("../Entity/RoomEntity");


class RoomManager {
	constructor() {
		this.rooms = {};
		this.usedRoom = [];
		this.cachedRoom = [];

		this.maxRoom = 0;
		this.startID = 0;
		this.count = 0;
		this.app;

		this.uid2Rooms = {};
	}
	Init(application, opt) {
		this.app = application;
		this.opt = opt || {};
		this.maxRoom = opt.maxRoom || 200;
		this.startID = opt.startID || 10000;

		this.PreCreateRoom(100);
	}
	PreCreateRoom(num) {
		setTimeout(() => {
			let tmp = [];
			while (num-- > 0) {
				tmp.push(this.CreateRoom());
			}

			for (let i = 0; i < tmp.length; i++) {
				this.ReleaseRoom(tmp[i].roomID);
			}
		}, 1000);
	}
	CreateRoom() {
		if (this.cachedRoom.length > 0) {
			let roomID = this.cachedRoom.shift();
			this.rooms[roomID].active = true;
			this.usedRoom.push(roomID);
			return this.rooms[roomID];
		}

		//limited max this.rooms
		if (this.count >= this.maxRoom) {
			console.error("Room is full");
			return;
		}

		let curRoomID = this.startID + Math.floor(this.maxRoom * Math.random());
		while (!!this.rooms[curRoomID]) {
			curRoomID = this.startID + Math.floor(this.maxRoom * Math.random());
		}
		this.count++;

		let channel = this.app.get('channelService').createChannel(curRoomID);
		let curRoom = new Room(curRoomID, channel, this);

		this.rooms[curRoomID] = curRoom;

		this.usedRoom.push(curRoomID);
		//console.log(curRoom);
		curRoom.active = true;
		return curRoom;
	}
	GetRoom(rid) {
		if (!this.rooms[rid] || this.rooms[rid].active == false)
			return null;

		return this.rooms[rid];
	}
	ReleaseRoom(roomID) {
		let idx = this.usedRoom.indexOf(roomID);
		//cam not find room id
		if (idx < 0) {
			return;
		}
		this.rooms[roomID].active = false;
		this.usedRoom.splice(idx, 1);
		this.cachedRoom.push(roomID);
	}
	GetPlayerRoomID(uid) {
		return this.uid2Rooms[uid];
	}
	SetPlayerRoomID(uid, rid) {
		this.uid2Rooms[uid] = rid;
	}
	GetAllRoomInfo() {
		let list = [];
		for (let i = this.usedRoom.length - 1; 0 <= i; i--) {
			list[i] = this.rooms[this.usedRoom[i]].GetBaseInfo()
		}
		return { serverId: this.app.getServerId(), totalCount: this.usedRoom.length, list: list }
	}

}


module.exports = new RoomManager();