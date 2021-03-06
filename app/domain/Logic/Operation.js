



// let lastOperation = 0;
// let hasOperation = [0,0,0,0];
// function ClearOperation()
// {
// 	for(let i=0; i<hasOperation.length; i++)
// 	{
// 		hasOperation[i] = 0;
// 	}
// }
// function AddOperation(idx, op)
// {
// 	hasOperation[idx] = op;
// }

function Operation() {

	let hasOperation = [0, 0, 0, 0];
	return {
		ClearOperation: function () {
			for (let i = 0; i < hasOperation.length; i++) {
				hasOperation[i] = 0;
			}
		},
		AddOperation: function (idx, op) {
			hasOperation[idx] |= op;
			if (op != 2)
				hasOperation[idx] |= 1;
		},
		ClearSingleOperation: function (idx) {
			hasOperation[idx] = 0;
		},
		GetOperation: function (idx) {
			return hasOperation[idx];
		},

		CheckOperation: function (idx, op) {
			return hasOperation[idx] & op;
		},

		CheckAllOperation: function () {
			//console.log(hasOperation);
			for (let i = 0; i < hasOperation.length; i++) {
				if (hasOperation[i])
					return true;
			}
			return false;
		},

		ForEachOperation(cb) {
			for (let i = 0; i < hasOperation.length; i++) {
				if (hasOperation[i])
					cb(i, hasOperation[i]);
			}
		}
	}
};

module.exports = Operation;