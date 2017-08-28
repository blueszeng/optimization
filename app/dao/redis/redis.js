'use strict';
let redis = require('redis');
let bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
let client;
let init = function (app) {
    if (!!client) {
        return client;
    }
    let redisConfig = app.get('redisConfig');
    console.log(redisConfig)
    client = redis.createClient(redisConfig, {});
    client.on('error', function (err) {
        console.log('Error ' + err);
    });
    client.on('connect', function () {
        console.log('connect redis ...');
    });
    return client;
};
module.exports = {
    Init: init
};