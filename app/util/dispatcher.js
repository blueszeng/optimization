var crc = require('crc');

module.exports.dispatch = function(uid, connectors) {
	var index = Math.abs(Number(crc.crc32(uid + ""))) % connectors.length;
	//console.log(index,Number(crc.crc32(uid)) ,connectors.length);
	//
	// console.log(uid, Number(crc.crc32((uid + ""))), index);
	return connectors[index];
};
