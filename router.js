var url = require('url');
var realTime = require('./real_time');

function route(req, res) {
    var pathname = url.parse(req.url).pathname;

    switch (pathname) {
        case '/line':
            getLines(req, res);
            break;
        case '/realTime':
            getRealTimeInfo(req, res);
            break;
    }
}

function getLines(originReq, originRes) {
    var originQueryObj = url.parse(originReq.url, true).query;
    var lineName = originQueryObj.name;
    var Line = global.models.Line;

    Line.find({line: new RegExp(lineName, 'i')}, function (err, lines) {
        if (err) {
            console.log('exec query error. lineName = ' + lineName);
        } else {
            originRes.writeHeader(200, {'Content-type': 'application/json'});
            originRes.write(JSON.stringify(lines));
        }
        originRes.end();
    });
}

function getRealTimeInfo(originReq, originRes) {
    var originQueryObj = url.parse(originReq.url, true).query;
    var lineId = originQueryObj.id;
    realTime.get(lineId, function (arr) {
        originRes.writeHeader(200, {'Content-type': 'application/json'});
        originRes.write(JSON.stringify(arr));
        originRes.end();
    });
}

exports.route = route;