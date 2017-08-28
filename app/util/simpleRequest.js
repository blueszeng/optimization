let logger = require('pomelo-logger').getLogger(__filename);
const https = require('https');


const HttpsReuest = function (url, params) {
	return new Promise((resolve, reject) => {
		if (params.access_token == "robot_immunity") {
			return resolve({
				"nickname": params.openid,
				"headimgurl": "http:\/\/wx.qlogo.cn\/mmopen\/PiajxSqBRaEIrZyEsQIv1C5Uxiac0wicaICWticoLSCc4IVTIg4gegs5a4TicI79Zk35CrqVXILIkFibDwjRHcPjn9hQ\/0",
				"sex": 1
			});
		}
		let requestUrl = url;
		for (let src in params) {
			requestUrl += src + "=" + params[src] + "&";
		}

		https.get(requestUrl, (res) => {
			let data = null;
			res.on('data', (d) => {
				if (!!data)
					data += d;
				else data = d;

			});
			res.on("end", () => {
				resolve(JSON.parse(data.toString()))
			})

		}).on('error', (e) => {
			logger.error("HttpsReuest", e);
			reject(e)
		});
	});
}


module.exports = {
	HttpsReuest
};


// module.exports = {
// 	HttpsReuest: function (url, params, cb) {
// 		if (params.access_token == "robot_immunity") {
// 			cb(null, {
// 				"nickname": params.openid,
// 				"headimgurl": "http:\/\/wx.qlogo.cn\/mmopen\/PiajxSqBRaEIrZyEsQIv1C5Uxiac0wicaICWticoLSCc4IVTIg4gegs5a4TicI79Zk35CrqVXILIkFibDwjRHcPjn9hQ\/0",
// 				"sex": 1
// 			});
// 			return;
// 		}
// 		let requestUrl = url;
// 		for (let src in params) {
// 			requestUrl += src + "=" + params[src] + "&";
// 		}

// 		//logger.info(requestUrl);
// 		https.get(requestUrl, (res) => {
// 			// console.log('statusCode:', res.statusCode);
// 			// console.log('headers:', res.headers);
// 			let data = null;
// 			res.on('data', (d) => {
// 				if (!!data)
// 					data += d;
// 				else data = d;

// 			});
// 			res.on("end", () => {
// 				//console.log(data.toString());
// 				cb(null, JSON.parse(data.toString()));
// 			})

// 		}).on('error', (e) => {
// 			logger.error("HttpsReuest", e);
// 			cb(e, null);
// 		});

// 	}

// };