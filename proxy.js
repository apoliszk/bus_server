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
                obj.station = parser.getNodeText(tds[i]);
                obj.bus = parser.getNodeText(tds[i + 2]);
                obj.time = parser.getNodeText(tds[i + 3]);
                arr.push(obj);
            }
            callBack(arr);
        });
    });
}

function getLineInfo(lineNum, callBack) {
    var resultArr = [];

    var postData = '__VIEWSTATE=%2FwEPDwUJNDk3MjU2MjgyD2QWAmYPZBYCAgMPZBYCAgEPZBYCAgYPDxYCHgdWaXNpYmxlaGRkZNSq3M6FLiH9uhezHaCZYWZQT%2F9VbteYCJ3RkqvkKG66'
        + '&__VIEWSTATEGENERATOR=964EC381'
        + '&__EVENTVALIDATION=%2FwEWAwLZi%2B7ABAL88Oh8AqX89aoKVJoV4zpUp4emFejE9%2F7pXtFgzQ3x2PHjaMh9lXvOycg%3D'
        + '&ctl00%24MainContent%24LineName=' + lineNum
        + '&ctl00%24MainContent%24SearchLine=%E6%90%9C%E7%B4%A2';

    var options = {
        host: 'www.szjt.gov.cn',
        port: 80,
        method: 'POST',
        path: '/apts/APTSLine.aspx',
        headers: {
            'Content-Length': postData.length,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var html = '';
    var req = http.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (data) {
                html += data;
            }).on('end', function () {
                var Line = global.models.Line;
                var lineObj;
                var $ = cheerio.load(html);
                var tds = $(".main td");

                var index = 0;
                var lineId = parser.getLineId(tds[index]);
                getLineRealTimeInfo(lineId, getLineStationInfoCompleteHandler);
                function getLineStationInfoCompleteHandler(arr) {
                    lineObj = new Line();
                    lineObj._id = lineId;
                    lineObj.name = parser.getNodeText(tds[index]);
                    lineObj.stations = [];
                    for (var i = 0, len = arr.length; i < len; i++) {
                        lineObj.stations.push(arr[i].station);
                    }
                    if (len > 2) {
                        if (arr[0] != arr[len - 1]) {
                            lineObj.description = arr[0] + ' -> ' + arr[len - 1];
                        } else {
                            lineObj.description = arr[0] + ' -> ' + arr[1] + '...' + ' -> ' + arr[len - 1];
                        }
                    }
                    resultArr.push(lineObj);

                    console.log('get ' + lineObj.name);

                    index += 2;
                    if (index < tds.length) {
                        lineId = parser.getLineId(tds[index]);
                        getLineRealTimeInfo(lineId, getLineStationInfoCompleteHandler);
                    } else {
                        callBack(resultArr);
                    }
                }
            });
        }
    );
    req.write(postData);
    req.end();
}

exports.getLineRealTimeInfo = getLineRealTimeInfo;
exports.getLineInfo = getLineInfo;