var http = require('http');
var router = require('../router');
var config = require('../config').config;
var model = require('../model');
var mongoose = require('mongoose');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
    console.log('connect to db failed');
});
db.once('open', function () {
    model.initModels(mongoose);
    var server = http.createServer(function (req, res) {
        router.route(req, res);
    });
    server.listen(config.port, config.ip);
    console.log('Server running at http://' + config.ip + ':' + config.port);
});
