var config = require('../config').config;
var model = require('../model');
var proxy = require('../proxy');
var mongoose = require('mongoose');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
    console.log('connect to db failed');
});
db.once('open', function () {
    model.init(mongoose);
    var Line = global.models.Line;

    var lineNum = 0;
    Line.remove({}, function () {
        proxy.getLineInfo(lineNum, callBackFunc);
    });

    function callBackFunc(arr) {
        var lineObj;
        for (var i = 0, len = arr.length; i < len; i++) {
            lineObj = arr[i];
            if (!isExist(lineNum, lineObj.line)) {
                lineObj.save();
            }
        }
        lineNum++;
        if (lineNum < 10) {
            proxy.getLineInfo(lineNum, callBackFunc)
        } else {
            db.close();
        }
    }

    function isExist(lineNum, line) {
        var char;
        for (var i = 0, len = line.length; i < len; i++) {
            char = line.charAt(i);
            if (!isNaN(char)) {
                if (parseInt(char) < lineNum) {
                    return true;
                }
            }
        }
        return false;
    }
});
