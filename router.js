var cheerio = require('cheerio');
var http = require('http');
var url = require('url');

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
    originRes.writeHeader(200, {'Content-type': 'application/json'});
    originRes.write(lineName);
    originRes.end();
}

function getRealTimeInfo(originReq, originRes) {
    var originQueryObj = url.parse(originReq.url, true).query;
    var lineId = originQueryObj.id;
    var options = {
        host: 'www.szjt.gov.cn',
        port: 80,
        path: '/apts/APTSLine.aspx?lineGuid=' + lineId
    };

    var html = '';
    http.get(options, function (res) {
        res.on('data', function (data) {
            html += data;
        }).on('end', function () {
            var $ = cheerio.load(html);
            var tds = $(".main td");
            var len = tds.length;
            var arr = [];
            var obj;
            for (var i = 0; i < len; i += 4) {
                obj = {};
                obj.name = getText(tds[i]);
                obj.bus = getText(tds[i + 2]);
                obj.time = getText(tds[i + 3]);
                arr.push(obj);
            }
            originRes.writeHeader(200, {'Content-type': 'application/json'});
            originRes.write(JSON.stringify(arr));
            originRes.end();
        });
    });

    function getText(n) {
        if (n.children && n.children.length > 0) {
            return getText(n.children[0]);
        }
        return n.data;
    }
}

exports.route = route;