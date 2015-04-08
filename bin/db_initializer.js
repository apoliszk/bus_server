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
    var startDate = new Date();
    var num = 0;
    model.init(mongoose);
    global.models.Line.remove({}, function () {
        proxy.getLineInfo(num, callBackFunc);
    });
    function callBackFunc(arr) {
        var lineObj;
        for (var i = 0, len = arr.length; i < len; i++) {
            lineObj = arr[i];
            lineObj.save();
        }
        num++;
        if (num < 10) {
            proxy.getLineInfo(num, callBackFunc)
        } else {
            console.log('initialize db complete. time: ' + (new Date().getTime() - startDate.getTime()));
            db.close();
        }
    }
});
