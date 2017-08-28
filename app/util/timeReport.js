module.exports = function (opts) {
    return new Module(opts);
}

let moduleId = "timeReport";
module.exports.moduleId = moduleId;

let Module = function (opts) {
    this.app = opts.app;
    this.type = opts.type || 'pull';
    this.interval = opts.interval || 5;
}

Module.prototype.monitorHandler = function (agent, msg, cb) {
    console.log(this.app.getServerId() + '  ' + msg);
    let serverId = agent.id;
    let time = new Date().toString();

    agent.notify(moduleId, { serverId: serverId, time: time });
};

Module.prototype.masterHandler = function (agent, msg) {
    if (!msg) {
        let testMsg = 'testMsg';
        agent.notifyAll(moduleId, testMsg);
        return;
    }

    console.log(msg);
    let timeData = agent.get(moduleId);
    if (!timeData) {
        timeData = {};
        agent.set(moduleId, timeData);
    }
    timeData[msg.serverId] = msg.time;
};


Module.prototype.clientHandler = function (agent, msg, cb) {
    console.log("clientHandler" + this.app.getServerId() + '  ' + msg);
    cb(null, agent.get(moduleId));
}