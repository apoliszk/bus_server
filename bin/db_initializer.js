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

    var num = 0;
    Line.remove({}, function () {
        proxy.getLineInfo(num, callBackFunc);
    });

    function callBackFunc(arr) {
        var lineObj;
        for (var i = 0, len = arr.length; i < len; i++) {
            lineObj = arr[i];
            if (!isExist(num, lineObj.name)) {
                lineObj.save();
            }
        }
        num++;
        if (num < 10) {
            proxy.getLineInfo(num, callBackFunc)
        } else {
            db.close();
        }
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
