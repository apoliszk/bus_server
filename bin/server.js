var http = require('http');
var parser = require('../parser');
var config = require('../config').config;

var server = http.createServer(function (req, res) {
    parser.parse(req, res);
});
server.listen(config.port, config.ip);

console.log('Server running at http://' + config.ip + ':' + config.port);