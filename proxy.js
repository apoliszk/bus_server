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

function getLineInfo(lineNum, optimize, callBackFunc, saveFunc) {
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
                var lineObj;
                var $ = cheerio.load(html);
                var tds = $(".main td");

                var index = getNextIndex(0);
                if (index >= 0) {
                    var lineId = parser.getLineId(tds[index]);
                    getLineRealTimeInfo(lineId, getLineStationInfoCompleteHandler);
                } else {
                    callBackFunc();
                }

                function getLineStationInfoCompleteHandler(arr) {
                    lineObj = {};
                    lineObj._id = lineId;
                    lineObj.name = parser.getNodeText(tds[index]);
                    lineObj.stations = [];
                    for (var i = 0, len = arr.length; i < len; i++) {
                        lineObj.stations.push(arr[i].station);
                    }
                    if (len > 2) {
                        if (arr[0].station != arr[len - 1].station) {
                            lineObj.description = arr[0].station + ' -> ' + arr[len - 1].station;
                        } else {
                            lineObj.description = arr[0].station + ' -> ' + arr[1].station + '...' + ' -> ' + arr[len - 1].station;
                        }
                    }
                    saveFunc(lineObj);

                    console.log('get ' + lineObj.name);

                    index = getNextIndex(index + 2);
                    if (index >= 0) {
                        lineId = parser.getLineId(tds[index]);
                        getLineRealTimeInfo(lineId, getLineStationInfoCompleteHandler);
                    } else {
                        callBackFunc();
                    }
                }

                function getNextIndex(index) {
                    if (!optimize) {
                        if (index < tds.length) {
                            return index;
                        } else {
                            return -1;
                        }
                    }
                    var lineName;
                    while (index < tds.length) {
                        lineName = parser.getNodeText(tds[index]);
                        if (!isExist(lineNum, lineName)) {
                            return index;
                        }
                        index += 2;
                    }
                    return -1;
                }

                function isExist(n, lineName) {
                    var char;
                    for (var i = 0, len = lineName.length; i < len; i++) {
                        char = lineName.charAt(i);
                        if (!isNaN(char)) {
                            if (parseInt(char) < n) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            });
        }
    );
    req.write(postData);
    req.end();
}

exports.getLineRealTimeInfo = getLineRealTimeInfo;
exports.getLineInfo = getLineInfo;