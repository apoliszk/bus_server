var cheerio = require('cheerio');
var config = require('../config').config;
var http = require('http');
var mongoose = require('mongoose');

// execute
mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
    console.log('connect to db failed');
});
db.once('open', function () {
    var resultArr = [];
    var lineSchema = mongoose.Schema({
        lineId: String,
        line: String,
        info: String
    });
    var Line = mongoose.model('Line', lineSchema);
    getLineInfo(0);

    // function define
    function getLineInfo(lineNum) {
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
                var $ = cheerio.load(html);
                var tds = $(".main td");
                var len = tds.length;
                var line;
                var obj;
                for (var i = 0; i < len; i += 2) {
                    line = getText(tds[i]);
                    if (!isExist(lineNum, line)) {
                        obj = new Line();
                        obj.lineId = getLineId(tds[i]);
                        obj.line = line;
                        obj.info = getText(tds[i + 1]);
                        obj.save();
                        resultArr.push(obj);
                    }
                }
                if (lineNum < 10) {
                    getLineInfo(lineNum + 1);
                } else {
                    resultArr.sort(function (a, b) {
                        if (isNaN(a.line) && isNaN(b.line)) {
                            if (a.line > b.line) {
                                return 1;
                            } else if (a.line < b.line) {
                                return -1;
                            }
                            return 0;
                        } else if (!isNaN(a.line) && !isNaN(b.line)) {
                            return parseInt(a.line) - parseInt(b.line);
                        } else if (!isNaN(a.line) && isNaN(b.line)) {
                            return -1;
                        } else if (isNaN(a.line) && !isNaN(b.line)) {
                            return 1;
                        }
                        return 0;
                    });
                    console.log(JSON.stringify(resultArr));
                }
            });
        });
        req.write(postData);
        req.end();
    }

    function isExist(lineNum, line) {
        var len = line.length;
        var char;
        for (var i = 0; i < len; i++) {
            char = line.charAt(i);
            if (!isNaN(char)) {
                if (parseInt(char) < lineNum) {
                    return true;
                }
            }
        }
        return false;
    }

    function getText(n) {
        if (n.children && n.children.length > 0) {
            return getText(n.children[0]);
        }
        return n.data;
    }

    var lineIdReg = /[^?]+\?lineguid=([^&]+).+/i;

    function getLineId(n) {
        if (n.name == 'a') {
            var href = n.attribs.href;
            var result = lineIdReg.exec(href);
            if (result.length == 2) {
                return result[1];
            } else {
                return undefined;
            }
        } else if (n.children && n.children.length > 0) {
            return getLineId(n.children[0]);
        }
        return undefined;
    }
});
