var cheerio = require('cheerio');
var http = require('http');
var url = require('url');

function parse(originReq, originRes) {
    var originQueryString = url.parse(originReq.url).query;

    var options = {
        host: 'www.szjt.gov.cn',
        port: 80,
        path: '/apts/APTSLine.aspx?' + originQueryString
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

exports.parse = parse;