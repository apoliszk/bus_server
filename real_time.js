var cheerio = require('cheerio');
var http = require('http');
var parser = require('./htmlParser');

function getLineRealTimeInfo(lineId, callBack) {
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
                obj.name = parser.getNodeText(tds[i]);
                obj.bus = parser.getNodeText(tds[i + 2]);
                obj.time = parser.getNodeText(tds[i + 3]);
                arr.push(obj);
            }
            callBack(arr);
        });
    });
}
exports.get = getLineRealTimeInfo;