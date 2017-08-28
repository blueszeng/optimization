
/*
	用于申请解散房间

*/
const Max_Player = 4;
const ApplyStatus = {
	Unknow: 0,
	Disagree: 1,
	Agree: 2,
	Creator: 3
};
class RoomClose {

	constructor(idx, agreeCB, disagreeCB) {
		let status = {};

		for (let i = 0; i < Max_Player; i++)
			status[i] = ApplyStatus.Unknow;

		this.status = status;
		this.count = 0;
		this.cntAgree = 0;
		this.cntDisagree = 0;
		this.agreeCB = agreeCB;
		this.disagreeCB = disagreeCB;
		this.SetStatus(idx, ApplyStatus.Creator);
		let self = this;
		this.timer = setTimeout(function () {
			// body...
			for (let j = 0; j < Max_Player; j++) {
				self.SetStatus(j, ApplyStatus.Agree);
			}
		}, 300000);

	}

	SetStatus(idx, value) {
		if (!!this.status[idx] || !value)
			return false;

		if (value == ApplyStatus.Agree) {
			this.status[idx] = ApplyStatus.Agree;
			this.cntAgree++;
		}
		else if (value == ApplyStatus.Creator) {
			this.status[idx] = ApplyStatus.Creator;
			this.cntAgree++;
		}
		else {
			this.status[idx] = ApplyStatus.Disagree;
			this.cntDisagree++;
		}
		this.count++;
		if (this.count == 4 || this.cntAgree >= 3 || this.Disagree >= 2) {
			//console.log("final" ,idx, value);
			if (this.cntAgree > this.cntDisagree) {
				//	console.log("cb");
				this.agreeCB();
			}
			else {
				this.disagreeCB();
			}

			this.destroy();
		}
		return true;
	}

	destroy() {
		clearTimeout(this.timer);
	}
}

module.exports = RoomClose;